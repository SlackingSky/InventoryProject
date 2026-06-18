using InventoryBackend.Models;
using InventoryBackend.Utils;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;

namespace InventoryBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuppliersController : ControllerBase
    {
        private readonly string _connectionString;
        public SuppliersController(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            try
            {
                var list = new List<SupplierResponse>();
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_GetAllSuppliers", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync()) list.Add(new SupplierResponse
                        {
                            SupplierID = Convert.ToInt32(reader["SupplierID"]),
                            SupplierName = reader["SupplierName"].ToString(),
                            ContactNumber = reader["ContactNumber"].ToString(),
                            EmailAddress = reader["EmailAddress"].ToString(),
                            SupplierAddress = reader["SupplierAddress"].ToString()
                        });
                    }
                }
                return Ok(list);
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpPost]
        public async Task<IActionResult> PostAsync([FromBody] SupplierRequest request)
        {
            try
            {
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_InsertSupplier", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_Name", request.SupplierName);
                    cmd.Parameters.AddWithValue("@p_Contact", request.ContactNumber);
                    cmd.Parameters.AddWithValue("@p_Email", request.EmailAddress);
                    cmd.Parameters.AddWithValue("@p_Address", request.SupplierAddress);
                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return Ok(new { message = "Supplier added!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }
    }
}