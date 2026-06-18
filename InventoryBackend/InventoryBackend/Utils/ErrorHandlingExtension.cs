using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace InventoryBackend.Utils
{
    public static class ErrorHandlingExtension
    {
        public static IActionResult HandleDbError(this ControllerBase controller, MySqlException ex)
        {
            if (ex.Number == 1062)
                return controller.Conflict(new { error = "Duplicate entry detected." });

            if (ex.Number == 1042)
                return controller.StatusCode(503, new { error = "Database offline. Please check your connection." });

            return controller.StatusCode(500, new { error = ex.Message });
        }
    }
}
