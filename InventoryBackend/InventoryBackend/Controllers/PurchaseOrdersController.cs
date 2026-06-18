using InventoryBackend.Models;
using InventoryBackend.Utils;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;
using System.Text.Json;

namespace InventoryBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseOrdersController : ControllerBase
    {
        private readonly string _connectionString;

        public PurchaseOrdersController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                                ?? throw new InvalidOperationException("Connection string not found.");
        }

        [HttpPost]
        public async Task<IActionResult> CreatePurchaseOrderAsync([FromBody] PurchaseOrderRequest request)
        {
            try
            {
                string itemsJson = JsonSerializer.Serialize(request.Items);

                using (MySqlConnection conn = new MySqlConnection(_connectionString))
                {
                    using (MySqlCommand cmd = new MySqlCommand("sp_CreatePurchaseOrder", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        cmd.Parameters.AddWithValue("@p_SupplierID", request.SupplierID);
                        cmd.Parameters.AddWithValue("@p_PurchaseDate", request.PurchaseDate);
                        cmd.Parameters.AddWithValue("@p_DeliveryStatus", request.DeliveryStatus);
                        cmd.Parameters.AddWithValue("@p_CreatedBy", request.CreatedBy);
                        cmd.Parameters.AddWithValue("@p_ItemsJSON", itemsJson);

                        await conn.OpenAsync();
                        await cmd.ExecuteNonQueryAsync();
                    }
                }

                return Ok(new { message = "Purchase Order created successfully!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPurchaseOrdersAsync()
        {
            try
            {
                var list = new List<PurchaseOrderSummaryResponse>();
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_GetAllPurchaseOrders", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(new PurchaseOrderSummaryResponse
                            {
                                PurchaseOrderID = Convert.ToInt32(reader["PurchaseOrderID"]),
                                PurchaseDate = Convert.ToDateTime(reader["PurchaseDate"]),
                                ReceivedDate = reader["ReceivedDate"] != DBNull.Value ? Convert.ToDateTime(reader["ReceivedDate"]) : null,
                                DeliveryStatus = reader["DeliveryStatus"].ToString(),
                                SupplierName = reader["SupplierName"].ToString(),
                                CreatedByName = reader["CreatedByName"].ToString()
                            });
                        }
                    }
                }
                return Ok(list);
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }
    }
}