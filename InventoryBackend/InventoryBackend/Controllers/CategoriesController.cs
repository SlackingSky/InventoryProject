using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using InventoryBackend.Models;
using InventoryBackend.Utils;
using System.Data;

namespace InventoryBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly string _connectionString;
        public CategoriesController(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

        [HttpGet]
        public async Task<IActionResult> GetAsync()
        {
            try
            {
                var list = new List<CategoryResponse>();
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_GetAllCategories", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync()) list.Add(new CategoryResponse
                        {
                            CategoryID = Convert.ToInt16(reader["CategoryID"]),
                            CategoryName = reader["CategoryName"].ToString(),
                            CategoryDescription = reader["CategoryDescription"].ToString()
                        });
                    }
                }
                return Ok(list);
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        [HttpPost]
        public async Task<IActionResult> PostAsync([FromBody] CategoryRequest request)
        {
            try
            {
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_InsertCategory", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_Name", request.CategoryName);
                    cmd.Parameters.AddWithValue("@p_Desc", request.CategoryDescription);
                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return Ok(new { message = "Category added!" });
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }
    }
}