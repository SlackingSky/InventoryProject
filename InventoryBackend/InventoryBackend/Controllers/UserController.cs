using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using InventoryBackend.Models;
using InventoryBackend.Utils;
using System.Data;

namespace InventoryBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly string _connectionString;
        public UsersController(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

        [HttpGet]
        public async Task<IActionResult> GetUsersAsync()
        {
            try
            {
                var list = new List<UserListResponse>();
                using (var conn = new MySqlConnection(_connectionString))
                using (var cmd = new MySqlCommand("sp_GetAllUsers", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    await conn.OpenAsync();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            list.Add(new UserListResponse
                            {
                                UserID = Convert.ToInt32(reader["UserID"]),
                                Username = reader["Username"].ToString(),
                                FullName = reader["FullName"].ToString(),
                                UserRole = reader["UserRole"].ToString()
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