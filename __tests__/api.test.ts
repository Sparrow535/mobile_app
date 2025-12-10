import { fetchMovies } from "@/services/api";

describe("fetchMovies", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn() as any;
  });

  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = originalFetch;
  });

  it("filters out movies without poster_path", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { id: 1, title: "Has Poster", poster_path: "/abc.jpg" },
          { id: 2, title: "No Poster", poster_path: null },
          { id: 3, title: "Blank Poster", poster_path: "   " },
        ],
      }),
      statusText: "OK",
    });

    const results = await fetchMovies({ query: "" });

    expect(results).toEqual([
      { id: 1, title: "Has Poster", poster_path: "/abc.jpg" },
    ]);
    expect(global.fetch).toHaveBeenCalled();
  });

  it("throws when the API call fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: "Bad Request",
    });

    await expect(fetchMovies({ query: "test" })).rejects.toThrow(
      "Failed to fetch movies: Bad Request"
    );
  });
});
