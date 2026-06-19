using System;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using InventoryBackend.Models;
using InventoryBackend.Utils;
using System.Data;

namespace InventoryBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StockMovementsController : ControllerBase
    {
        private readonly string _connectionString;
        public StockMovementsController(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            try
            {
                var list = new List<StockMovementResponse>();
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_GetAllStockMovements", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync()) list.Add(new StockMovementResponse
                        {
                            StockMovementID = Convert.ToInt64(reader["StockMovementID"]),
                            WarehouseName = reader["WarehouseName"].ToString(),
                            ProductName = reader["ProductName"].ToString(),
                            MovementType = reader["MovementType"].ToString(),
                            MovementDate = Convert.ToDateTime(reader["MovementDate"]),
                            MovementQuantity = Convert.ToInt32(reader["MovementQuantity"]),
                            MovementReference = reader["MovementReference"].ToString(),
                            ProcessedByName = reader["ProcessedByName"].ToString()
                        });
                    }
                }
                return Ok(list);
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpPost]
        public async Task<IActionResult> PostAsync([FromBody] StockMovementRequest request)
        {
            try
            {
                bool reducesStock = request.MovementType == "Stock Out" ||
                                    request.MovementType == "Transfer" ||
                                    (request.MovementType == "Adjustment" && request.MovementQuantity < 0);

                int deductionAmount = request.MovementType == "Adjustment" ? Math.Abs(request.MovementQuantity) : request.MovementQuantity;

                if (reducesStock)
                {
                    int currentStock = 0;
                    using (var conn = new MySqlConnection(_connectionString))
                    using (var cmd = new MySqlCommand("sp_GetStockAvailability", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@p_ProductID", request.ProductID);
                        cmd.Parameters.AddWithValue("@p_WarehouseID", request.WarehouseID);
                        await conn.OpenAsync();
                        var result = await cmd.ExecuteScalarAsync();
                        if (result != null && result != DBNull.Value) currentStock = Convert.ToInt32(result);
                    }

                    if (currentStock < deductionAmount)
                        return BadRequest(new { message = $"Action denied. Only {currentStock} units available in this warehouse. You cannot remove {deductionAmount}." });
                }

                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_InsertStockMovement", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_WarehouseID", request.WarehouseID);
                    cmd.Parameters.AddWithValue("@p_ProductID", request.ProductID);
                    cmd.Parameters.AddWithValue("@p_MovementType", request.MovementType);
                    cmd.Parameters.AddWithValue("@p_MovementQuantity", request.MovementQuantity);
                    cmd.Parameters.AddWithValue("@p_MovementReference", request.MovementReference);
                    cmd.Parameters.AddWithValue("@p_ProcessedBy", request.ProcessedBy);
                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }

                using (var conn2 = new MySqlConnection(_connectionString))
                using (var cmd2 = new MySqlCommand("sp_CleanupInventory", conn2))
                {
                    cmd2.CommandType = CommandType.StoredProcedure;
                    await conn2.OpenAsync();
                    await cmd2.ExecuteNonQueryAsync();
                }

                if (reducesStock)
                {
                    using (var connAuto = new MySqlConnection(_connectionString))
                    using (var cmdAuto = new MySqlCommand("sp_AutoDraftReorder", connAuto))
                    {
                        cmdAuto.CommandType = CommandType.StoredProcedure;
                        cmdAuto.Parameters.AddWithValue("@p_ProductID", request.ProductID);
                        cmdAuto.Parameters.AddWithValue("@p_ProcessedBy", request.ProcessedBy);
                        await connAuto.OpenAsync();
                        await cmdAuto.ExecuteNonQueryAsync();
                    }
                }

                return Ok(new { message = "Movement recorded!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            try
            {
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_DeleteStockMovement", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_ID", id);
                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return Ok(new { message = "Movement deleted!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }
    }
}