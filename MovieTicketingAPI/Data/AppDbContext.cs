using Microsoft.EntityFrameworkCore;
using MovieTicketingAPI.Models;

namespace MovieTicketingAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Movie> Movies { get; set; }
        public DbSet<Show> Shows { get; set; }
        public DbSet<Seat> Seats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Add index on MovieId for faster show queries
            modelBuilder.Entity<Show>()
                .HasIndex(s => s.MovieId)
                .HasDatabaseName("IX_Shows_MovieId");

            // Add index on ShowId for faster seat queries
            modelBuilder.Entity<Seat>()
                .HasIndex(s => s.ShowId)
                .HasDatabaseName("IX_Seats_ShowId");
        }
    }
}
