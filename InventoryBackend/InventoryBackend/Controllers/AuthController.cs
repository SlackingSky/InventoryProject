using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using InventoryBackend.Models;
using InventoryBackend.Utils;
using System.Data;

namespace InventoryBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly string _connectionString;

        public AuthController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                                ?? throw new InvalidOperationException("Connection string not found.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
        {
            try
            {
                using (MySqlConnection conn = new MySqlConnection(_connectionString))
                {
                    using (MySqlCommand cmd = new MySqlCommand("sp_GetUserAuth", conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@p_Username", request.Username);

                        await conn.OpenAsync();

                        using (var reader = await cmd.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                string storedHash = reader["UserPassword"].ToString();

                                bool passwordMatches = BCrypt.Net.BCrypt.Verify(request.Password, storedHash);

                                if (passwordMatches)
                                {
                                    var user = new UserResponse
                                    {
                                        UserID = Convert.ToInt32(reader["UserID"]),
                                        Username = reader["Username"].ToString(),
                                        FullName = reader["FullName"].ToString(),
                                        UserRole = reader["UserRole"].ToString()
                                    };
                                    return Ok(user);
                                }
                            }

                            return Unauthorized(new { message = "Invalid username or password" });
                        }
                    }
                }
            }
            catch (MySqlException ex) { return this.HandleDbError(ex); }
        }

        //[HttpPost("register-test-user")]
        //public async Task<IActionResult> RegisterTestUserAsync([FromBody] RegisterRequest request)
        //{
        //    try
        //    {
        //        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        //        using (MySqlConnection conn = new MySqlConnection(_connectionString))
        //        {
        //            string query = "INSERT INTO User (Username, FullName, UserPassword, UserRole) VALUES (@u, @f, @p, @r)";
        //            using (MySqlCommand cmd = new MySqlCommand(query, conn))
        //            {
        //                cmd.Parameters.AddWithValue("@u", request.Username);
        //                cmd.Parameters.AddWithValue("@f", request.FullName);
        //                cmd.Parameters.AddWithValue("@p", hashedPassword);
        //                cmd.Parameters.AddWithValue("@r", request.UserRole);
        //                await conn.OpenAsync();
        //                await cmd.ExecuteNonQueryAsync();
        //            }
        //        }

        //        return Ok(new { message = $"User {request.FullName} created successfully!", hash = hashedPassword });
        //    }
        //    catch (MySqlException ex) { return this.HandleDbError(ex); }
        //}
    }
}