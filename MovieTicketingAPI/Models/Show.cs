namespace MovieTicketingAPI.Models
{
    public class Show
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public DateTime ShowTime { get; set; }
    }
}
