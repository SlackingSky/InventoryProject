using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using InventoryBackend.Models;
using InventoryBackend.Utils;
using System.Data;

namespace InventoryBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly string _connectionString;
        public InventoryController(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

        [HttpGet]
        public async Task<IActionResult> GetLiveInventoryAsync()
        {
            try
            {
                var list = new List<InventoryResponse>();
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_GetLiveInventory", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(new InventoryResponse
                            {
                                InventoryID = Convert.ToInt32(reader["InventoryID"]),
                                ProductName = reader["ProductName"].ToString(),
                                WarehouseName = reader["WarehouseName"].ToString(),
                                ProductQuantity = Convert.ToInt32(reader["ProductQuantity"])
                            });
                        }
                    }
                }
                return Ok(list);
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpPost]
        public async Task<IActionResult> AddInventoryAsync([FromBody] InventoryRequest request)
        {
            try
            {
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_InsertInventory", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_ProductID", request.ProductID);
                    cmd.Parameters.AddWithValue("@p_WarehouseID", request.WarehouseID);
                    cmd.Parameters.AddWithValue("@p_ProductQuantity", request.ProductQuantity);

                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return Ok(new { message = "Inventory manually updated successfully!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }
    }
}