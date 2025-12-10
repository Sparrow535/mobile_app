import { fetchMovieDetails } from "@/services/api";

describe("fetchMovieDetails", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn() as any;
  });

  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = originalFetch;
  });

  it("returns parsed details when API succeeds", async () => {
    const mockResponse = {
      id: 123,
      title: "Test Movie",
      poster_path: "/poster.jpg",
      overview: "A movie.",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
      statusText: "OK",
    });

    const details = await fetchMovieDetails("123");

    expect(details).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/movie/123"),
      expect.any(Object)
    );
  });

  it("throws when API response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    });

    await expect(fetchMovieDetails("999")).rejects.toThrow(
      "Failed to fetch movie details: Not Found"
    );
  });
});
