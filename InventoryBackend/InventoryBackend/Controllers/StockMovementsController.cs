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