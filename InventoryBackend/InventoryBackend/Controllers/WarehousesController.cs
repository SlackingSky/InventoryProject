using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using InventoryBackend.Models;
using InventoryBackend.Utils;
using System.Data;

namespace InventoryBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WarehousesController : ControllerBase
    {
        private readonly string _connectionString;
        public WarehousesController(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            try
            {
                var list = new List<WarehouseResponse>();
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_GetAllWarehouses", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync()) list.Add(new WarehouseResponse
                        {
                            WarehouseID = Convert.ToInt16(reader["WarehouseID"]),
                            WarehouseName = reader["WarehouseName"].ToString(),
                            WarehouseLocation = reader["WarehouseLocation"].ToString()
                        });
                    }
                }
                return Ok(list);
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpPost]
        public async Task<IActionResult> PostAsync([FromBody] WarehouseRequest request)
        {
            try
            {
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_InsertWarehouse", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_Name", request.WarehouseName);
                    cmd.Parameters.AddWithValue("@p_Location", request.WarehouseLocation);
                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return Ok(new { message = "Warehouse added!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutAsync(short id, [FromBody] WarehouseRequest request)
        {
            try
            {
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_UpdateWarehouse", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_ID", id);
                    cmd.Parameters.AddWithValue("@p_Name", request.WarehouseName);
                    cmd.Parameters.AddWithValue("@p_Location", request.WarehouseLocation);
                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return Ok(new { message = "Warehouse updated!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(short id)
        {
            try
            {
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_DeleteWarehouse", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_ID", id);
                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return Ok(new { message = "Warehouse deleted!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }
    }
}