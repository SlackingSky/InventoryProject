using InventoryBackend.Models;
using InventoryBackend.Utils;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;

namespace InventoryBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StockMovementsController : ControllerBase
    {
        private readonly string _connectionString;

        public StockMovementsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                                ?? throw new InvalidOperationException("Connection string not found.");
        }

        [HttpPost]
        public async Task<IActionResult> CreateStockMovementAsync([FromBody] StockMovementRequest request)
        {
            try
            {
                using (MySqlConnection conn = new MySqlConnection(_connectionString))
                {
                    using (MySqlCommand cmd = new MySqlCommand("sp_InsertStockMovement", conn))
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
                }
                return Ok(new { message = "Stock movement recorded successfully!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStockMovementsAsync()
        {
            try
            {
                List<StockMovementResponse> movements = new List<StockMovementResponse>();

                using (MySqlConnection conn = new MySqlConnection(_connectionString))
                {
                    using (MySqlCommand cmd = new MySqlCommand("sp_GetAllStockMovements", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        await conn.OpenAsync();

                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                movements.Add(new StockMovementResponse
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
                    }
                }
                return Ok(movements);
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }
    }
}