using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieTicketingAPI.Data;
using MovieTicketingAPI.Models;

namespace MovieTicketingAPI.Controllers
{
    [ApiController]
    [Route("api/dbtest")]
    public class DbTestController : ControllerBase
    {
        private readonly AppDbContext _db;

        public DbTestController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult Check()
        {
            var movieCount = _db.Movies.Count();
            return Ok(new { MovieCount = movieCount });
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedData()
        {
            // Get all movies
            var movies = await _db.Movies.ToListAsync();
            int showsAdded = 0;
            int seatsAdded = 0;

            foreach (var movie in movies)
            {
                // Check if movie already has shows
                var existingShows = await _db.Shows.Where(s => s.MovieId == movie.Id).CountAsync();
                if (existingShows > 0) continue;

                // Add 3 shows per movie
                var showTimes = new[]
                {
                    DateTime.Today.AddDays(1).AddHours(10),  // Tomorrow 10 AM
                    DateTime.Today.AddDays(1).AddHours(14),  // Tomorrow 2 PM
                    DateTime.Today.AddDays(1).AddHours(18),  // Tomorrow 6 PM
                };

                foreach (var showTime in showTimes)
                {
                    var show = new Show
                    {
                        MovieId = movie.Id,
                        ShowTime = showTime
                    };
                    _db.Shows.Add(show);
                    await _db.SaveChangesAsync();
                    showsAdded++;

                    // Add 40 seats (A1-A10, B1-B10, C1-C10, D1-D10)
                    var rows = new[] { "A", "B", "C", "D" };
                    foreach (var row in rows)
                    {
                        for (int i = 1; i <= 10; i++)
                        {
                            _db.Seats.Add(new Seat
                            {
                                ShowId = show.Id,
                                SeatNumber = $"{row}{i}",
                                IsBooked = false
                            });
                            seatsAdded++;
                        }
                    }
                    await _db.SaveChangesAsync();
                }
            }

            return Ok(new { Message = "Seed complete", ShowsAdded = showsAdded, SeatsAdded = seatsAdded });
        }
    }
}
