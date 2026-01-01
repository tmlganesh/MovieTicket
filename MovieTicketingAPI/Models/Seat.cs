namespace MovieTicketingAPI.Models
{
    public class Seat
    {
        public int Id { get; set; }
        public int ShowId { get; set; }
        public string SeatNumber { get; set; }
        public bool IsBooked { get; set; }
    }
}
