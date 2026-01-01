using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieTicketingAPI.Data;
using MovieTicketingAPI.Models;

namespace MovieTicketingAPI.Controllers
{
    [ApiController]
    [Route("api/seats")]
    public class SeatsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public SeatsController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/seats/show/1
        [HttpGet("show/{showId}")]
        public async Task<ActionResult<IEnumerable<Seat>>> GetSeatsByShow(int showId)
        {
            var seats = await _db.Seats
                .AsNoTracking()
                .Where(s => s.ShowId == showId)
                .OrderBy(s => s.SeatNumber)
                .ToListAsync();

            // Auto-create seats if none exist for this show
            if (!seats.Any())
            {
                var show = await _db.Shows.FindAsync(showId);
                if (show == null) return NotFound("Show not found");

                var newSeats = new List<Seat>();
                var rows = new[] { "A", "B", "C", "D", "E" };
                foreach (var row in rows)
                {
                    for (int num = 1; num <= 10; num++)
                    {
                        newSeats.Add(new Seat { ShowId = showId, SeatNumber = $"{row}{num}", IsBooked = false });
                    }
                }
                await _db.Seats.AddRangeAsync(newSeats);
                await _db.SaveChangesAsync();
                seats = newSeats;
            }

            return seats;
        }

        // POST: api/seats/book/5
        [HttpPost("book/{seatId}")]
        public async Task<IActionResult> BookSeat(int seatId)
        {
            var seat = await _db.Seats.FindAsync(seatId);

            if (seat == null)
                return NotFound(new { message = "Seat not found" });

            if (seat.IsBooked)
                return BadRequest(new { message = "Seat already booked" });

            seat.IsBooked = true;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Seat booked successfully", seatId = seatId });
        }
    }
}
