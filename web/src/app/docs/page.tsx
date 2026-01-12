"use client";

import { useState } from "react";

interface RowConfig {
  id: number;
  title: string;
  category: string;
  language?: string;
  genre?: string;
  minRating: number;
  minVotes: number;
  yearsRange: number;
  description?: string;
}

const homepageRows: RowConfig[] = [
  // Top Rated Movies Rows (8 rows)
  {
    id: 1,
    title: "Top Rated Movies",
    category: "Top Rated",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 5,
    description: "Best movies from the last 5 years",
  },
  {
    id: 2,
    title: "Top Rated English Movies",
    category: "Top Rated",
    language: "English",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 3,
    title: "Top Rated Hindi Movies",
    category: "Top Rated",
    language: "Hindi",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 4,
    title: "Top Rated Bengali Movies",
    category: "Top Rated",
    language: "Bengali",
    minRating: 7.5,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 5,
    title: "Top Rated Tamil Movies",
    category: "Top Rated",
    language: "Tamil",
    minRating: 8.0,
    minVotes: 15000,
    yearsRange: 10,
  },
  {
    id: 6,
    title: "Top Rated Telugu Movies",
    category: "Top Rated",
    language: "Telugu",
    minRating: 8.0,
    minVotes: 5000,
    yearsRange: 10,
  },
  {
    id: 7,
    title: "Top Rated Malayalam Movies",
    category: "Top Rated",
    language: "Malayalam",
    minRating: 8.0,
    minVotes: 5000,
    yearsRange: 10,
  },
  {
    id: 8,
    title: "Top Rated Kannada Movies",
    category: "Top Rated",
    language: "Kannada",
    minRating: 7.5,
    minVotes: 5000,
    yearsRange: 15,
  },

  // Top Action Movies Rows (8 rows)
  {
    id: 9,
    title: "Top Action Movies",
    category: "Action",
    genre: "Action",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 10,
    title: "Top English Action Movies",
    category: "Action",
    language: "English",
    genre: "Action",
    minRating: 7.5,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 11,
    title: "Top Hindi Action Movies",
    category: "Action",
    language: "Hindi",
    genre: "Action",
    minRating: 7.5,
    minVotes: 10000,
    yearsRange: 15,
  },
  {
    id: 12,
    title: "Top Tamil Action Movies",
    category: "Action",
    language: "Tamil",
    genre: "Action",
    minRating: 8.0,
    minVotes: 15000,
    yearsRange: 10,
  },
  {
    id: 13,
    title: "Top Telugu Action Movies",
    category: "Action",
    language: "Telugu",
    genre: "Action",
    minRating: 7.5,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 14,
    title: "Top Malayalam Action Movies",
    category: "Action",
    language: "Malayalam",
    genre: "Action",
    minRating: 7.0,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 15,
    title: "Top Kannada Action Movies",
    category: "Action",
    language: "Kannada",
    genre: "Action",
    minRating: 7.0,
    minVotes: 1000,
    yearsRange: 20,
  },
  {
    id: 16,
    title: "Top Bengali Action Movies",
    category: "Action",
    language: "Bengali",
    genre: "Action",
    minRating: 6.5,
    minVotes: 500,
    yearsRange: 25,
  },

  // Top Comedy Movies Rows (8 rows)
  {
    id: 17,
    title: "Top Comedy Movies",
    category: "Comedy",
    genre: "Comedy",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 18,
    title: "Top English Comedy Movies",
    category: "Comedy",
    language: "English",
    genre: "Comedy",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 19,
    title: "Top Hindi Comedy Movies",
    category: "Comedy",
    language: "Hindi",
    genre: "Comedy",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 20,
    title: "Top Tamil Comedy Movies",
    category: "Comedy",
    language: "Tamil",
    genre: "Comedy",
    minRating: 7.0,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 21,
    title: "Top Telugu Comedy Movies",
    category: "Comedy",
    language: "Telugu",
    genre: "Comedy",
    minRating: 7.0,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 22,
    title: "Top Malayalam Comedy Movies",
    category: "Comedy",
    language: "Malayalam",
    genre: "Comedy",
    minRating: 7.0,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 23,
    title: "Top Kannada Comedy Movies",
    category: "Comedy",
    language: "Kannada",
    genre: "Comedy",
    minRating: 7.0,
    minVotes: 1000,
    yearsRange: 20,
  },
  {
    id: 24,
    title: "Top Bengali Comedy Movies",
    category: "Comedy",
    language: "Bengali",
    genre: "Comedy",
    minRating: 6.5,
    minVotes: 500,
    yearsRange: 25,
  },

  // Top Drama Movies Rows (8 rows)
  {
    id: 25,
    title: "Top Drama Movies",
    category: "Drama",
    genre: "Drama",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 26,
    title: "Top English Drama Movies",
    category: "Drama",
    language: "English",
    genre: "Drama",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 27,
    title: "Top Hindi Drama Movies",
    category: "Drama",
    language: "Hindi",
    genre: "Drama",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 28,
    title: "Top Tamil Drama Movies",
    category: "Drama",
    language: "Tamil",
    genre: "Drama",
    minRating: 7.0,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 29,
    title: "Top Telugu Drama Movies",
    category: "Drama",
    language: "Telugu",
    genre: "Drama",
    minRating: 7.0,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 30,
    title: "Top Malayalam Drama Movies",
    category: "Drama",
    language: "Malayalam",
    genre: "Drama",
    minRating: 7.0,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 31,
    title: "Top Kannada Drama Movies",
    category: "Drama",
    language: "Kannada",
    genre: "Drama",
    minRating: 7.0,
    minVotes: 1000,
    yearsRange: 20,
  },
  {
    id: 32,
    title: "Top Bengali Drama Movies",
    category: "Drama",
    language: "Bengali",
    genre: "Drama",
    minRating: 6.5,
    minVotes: 500,
    yearsRange: 25,
  },

  // Top Thriller Movies Rows (8 rows)
  {
    id: 33,
    title: "Top Thriller Movies",
    category: "Thriller",
    genre: "Thriller",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 34,
    title: "Top English Thriller Movies",
    category: "Thriller",
    language: "English",
    genre: "Thriller",
    minRating: 8.0,
    minVotes: 50000,
    yearsRange: 10,
  },
  {
    id: 35,
    title: "Top Hindi Thriller Movies",
    category: "Thriller",
    language: "Hindi",
    genre: "Thriller",
    minRating: 7.5,
    minVotes: 10000,
    yearsRange: 15,
  },
  {
    id: 36,
    title: "Top Tamil Thriller Movies",
    category: "Thriller",
    language: "Tamil",
    genre: "Thriller",
    minRating: 7.0,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 37,
    title: "Top Telugu Thriller Movies",
    category: "Thriller",
    language: "Telugu",
    genre: "Thriller",
    minRating: 7.0,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 38,
    title: "Top Malayalam Thriller Movies",
    category: "Thriller",
    language: "Malayalam",
    genre: "Thriller",
    minRating: 7.0,
    minVotes: 2000,
    yearsRange: 15,
  },
  {
    id: 39,
    title: "Top Kannada Thriller Movies",
    category: "Thriller",
    language: "Kannada",
    genre: "Thriller",
    minRating: 7.0,
    minVotes: 1000,
    yearsRange: 20,
  },
  {
    id: 40,
    title: "Top Bengali Thriller Movies",
    category: "Thriller",
    language: "Bengali",
    genre: "Thriller",
    minRating: 6.5,
    minVotes: 500,
    yearsRange: 25,
  },

  // Latest Star Movies Rows (7 rows)
  {
    id: 41,
    title: "Latest Hindi Star Movies",
    category: "Star Movies",
    language: "Hindi",
    minRating: 0,
    minVotes: 0,
    yearsRange: 3,
    description: "Rajkummar Rao, Varun Dhawan, Vicky Kaushal & more",
  },
  {
    id: 42,
    title: "Latest English Star Movies",
    category: "Star Movies",
    language: "English",
    minRating: 0,
    minVotes: 0,
    yearsRange: 3,
    description: "Dwayne Johnson, Chris Hemsworth, Tom Cruise & more",
  },
  {
    id: 43,
    title: "Latest Tamil Star Movies",
    category: "Star Movies",
    language: "Tamil",
    minRating: 0,
    minVotes: 0,
    yearsRange: 3,
    description: "Dhanush, Ajith Kumar, Sivakarthikeyan & more",
  },
  {
    id: 44,
    title: "Latest Telugu Star Movies",
    category: "Star Movies",
    language: "Telugu",
    minRating: 0,
    minVotes: 0,
    yearsRange: 3,
    description: "Ravi Teja, Mahesh Babu, Vijay Deverakonda & more",
  },
  {
    id: 45,
    title: "Latest Malayalam Star Movies",
    category: "Star Movies",
    language: "Malayalam",
    minRating: 0,
    minVotes: 0,
    yearsRange: 3,
    description: "Mohanlal, Mammootty, Fahadh Faasil & more",
  },
  {
    id: 46,
    title: "Latest Kannada Star Movies",
    category: "Star Movies",
    language: "Kannada",
    minRating: 0,
    minVotes: 0,
    yearsRange: 3,
    description: "Sudeep, Shiva Rajkumar, Rishab Shetty & more",
  },
  {
    id: 47,
    title: "Latest Bengali Star Movies",
    category: "Star Movies",
    language: "Bengali",
    minRating: 0,
    minVotes: 0,
    yearsRange: 3,
    description: "Jisshu Sengupta, Prosenjit Chatterjee & more",
  },

  // Special Rows
  {
    id: 48,
    title: "Top 10 This Week",
    category: "Special",
    minRating: 0,
    minVotes: 0,
    yearsRange: 0,
    description: "Top 10 highest-rated content this week",
  },
];

const categories = [
  "All",
  "Top Rated",
  "Action",
  "Comedy",
  "Drama",
  "Thriller",
  "Star Movies",
  "Special",
];

export default function DocsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRows = homepageRows.filter((row) => {
    const matchesCategory =
      selectedCategory === "All" || row.category === selectedCategory;
    const matchesSearch =
      row.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatVotes = (votes: number) => {
    if (votes >= 1000) return `${(votes / 1000).toFixed(0)}K`;
    return votes.toString();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Homepage Rows Documentation
          </h1>
          <p className="text-gray-400 text-lg">
            Complete guide to the {homepageRows.length} curated rows displayed
            on the homepage
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-500">
              {homepageRows.length}
            </div>
            <div className="text-gray-400 text-sm">Total Rows</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-500">8</div>
            <div className="text-gray-400 text-sm">Languages</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-500">5</div>
            <div className="text-gray-400 text-sm">Genres</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-500">15</div>
            <div className="text-gray-400 text-sm">Movies per Row</div>
          </div>
        </div>

        {/* Filter Strategy */}
        <div className="bg-zinc-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Filter Strategy</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-400 mb-2">
                Major Languages (English, Hindi)
              </h3>
              <p className="text-gray-400">
                50,000+ votes - Global audience reach
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-400 mb-2">
                Regional Powerhouse (Tamil)
              </h3>
              <p className="text-gray-400">
                15,000+ votes - Strong domestic + international
              </p>
            </div>
            <div>
              <h3 className="font-medium text-purple-400 mb-2">
                Regional Major (Telugu, Malayalam)
              </h3>
              <p className="text-gray-400">
                5,000+ votes - Significant audience base
              </p>
            </div>
            <div>
              <h3 className="font-medium text-orange-400 mb-2">
                Niche Regional (Bengali, Kannada)
              </h3>
              <p className="text-gray-400">
                1,000-2,000 votes + Extended year range
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search rows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Rows Table */}
        <div className="bg-zinc-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Row Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Min Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Min Votes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Years
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {row.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-white">
                        {row.title}
                      </div>
                      {row.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {row.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          row.category === "Top Rated"
                            ? "bg-blue-500/20 text-blue-400"
                            : row.category === "Action"
                              ? "bg-red-500/20 text-red-400"
                              : row.category === "Comedy"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : row.category === "Drama"
                                  ? "bg-purple-500/20 text-purple-400"
                                  : row.category === "Thriller"
                                    ? "bg-green-500/20 text-green-400"
                                    : row.category === "Star Movies"
                                      ? "bg-pink-500/20 text-pink-400"
                                      : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      {row.language || "All"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      {row.genre || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {row.minRating > 0 ? (
                        <span className="text-yellow-400">
                          {row.minRating}+
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {row.minVotes > 0 ? (
                        <span className="text-blue-400">
                          {formatVotes(row.minVotes)}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {row.yearsRange > 0 ? (
                        <span className="text-green-400">
                          {row.yearsRange}y
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tie-Breaker Info */}
        <div className="bg-zinc-900 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Tie-Breaker Strategy</h2>
          <p className="text-gray-400 mb-4">
            When multiple movies have the same IMDb rating, they are sorted
            using this hierarchy:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>
              <span className="text-blue-400">IMDb Rating</span> - Primary sort
              (descending)
            </li>
            <li>
              <span className="text-green-400">Vote Count</span> - More votes =
              more reliable rating
            </li>
            <li>
              <span className="text-purple-400">Release Year</span> - Newer
              movies prioritized
            </li>
            <li>
              <span className="text-orange-400">Title</span> - Alphabetical as
              final tie-breaker
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Last updated: January 2025</p>
        </div>
      </div>
    </div>
  );
}
