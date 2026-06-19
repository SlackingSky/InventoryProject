using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;

namespace InventoryBackend.Utils
{
    public static class ErrorHandlingExtension
    {
        public static IActionResult HandleDbError(this ControllerBase controller, MySqlException ex)
        {
            if (ex.Number == 1062)
                return controller.Conflict(new { message = "A duplicate record already exists." });

            if (ex.Number == 1451)
                return controller.BadRequest(new { message = "Action Denied: This record cannot be deleted because it is currently in use by other parts of the system (e.g. it has active inventory or orders attached to it)." });

            return controller.StatusCode(500, new { message = "A database error occurred.", details = ex.Message });
        }
    }
}