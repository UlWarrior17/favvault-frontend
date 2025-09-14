import { useState, useEffect } from "react";
import icon from "./assets/icon.png";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Star,
  Film,
  Tv,
  BookOpen,
  Book,
  Zap,
  Heart,
  Clock,
  Award,
} from "lucide-react";
import favServices from "./services/favorites";

export default function App() {
  const [favorites, setFavorites] = useState([]);
  const [categories] = useState([
    "All",
    "Movies",
    "TV Shows",
    "Anime",
    "Books",
    "Comics",
    "Manga",
  ]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingFav, setIsAddingFav] = useState(false);
  const [editingFav, setEditingFav] = useState(null);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, rating, title

  const [newFav, setNewFav] = useState({
    title: "",
    creator: "",
    year: "",
    description: "",
    category: "Movies",
    tags: "",
    rating: 5,
    status: "Want to Watch",
    coverUrl: "",
    notes: "",
  });

  const statusOptions = {
    Movies: ["Want to Watch", "Watching", "Completed", "Dropped", "On Hold"],
    "TV Shows": [
      "Want to Watch",
      "Watching",
      "Completed",
      "Dropped",
      "On Hold",
    ],
    Anime: ["Want to Watch", "Watching", "Completed", "Dropped", "On Hold"],
    Books: ["Want to Read", "Reading", "Completed", "Dropped", "On Hold"],
    Comics: ["Want to Read", "Reading", "Completed", "Dropped", "On Hold"],
    Manga: ["Want to Read", "Reading", "Completed", "Dropped", "On Hold"],
  };

  const categoryIcons = {
    Movies: Film,
    "TV Shows": Tv,
    Anime: Zap,
    Books: BookOpen,
    Comics: Book,
    Manga: Book,
  };

  useEffect(() => {
    favServices.getAll().then((initialFavs) => {
      setFavorites(initialFavs);
    });
  }, []);

  const filteredAndSortedFavorites = favorites
    .filter((fav) => {
      const matchesCategory =
        selectedCategory === "All" || fav.category === selectedCategory;
      const matchesSearch =
        fav.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "rating":
          return b.rating - a.rating;
        case "title":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const addFavorite = () => {
    if (newFav.title && newFav.creator) {
      const favorite = {
        id: Date.now(),
        title: newFav.title,
        creator: newFav.creator,
        year: newFav.year,
        description: newFav.description,
        category: newFav.category,
        tags: newFav.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        rating: parseInt(newFav.rating),
        status: newFav.status,
        coverUrl: newFav.coverUrl,
        notes: newFav.notes,
        createdAt: new Date().toISOString(),
      };
      favServices.create(favorite);

      setFavorites([favorite, ...favorites]);
      setNewFav({
        title: "",
        creator: "",
        year: "",
        description: "",
        category: "Movies",
        tags: "",
        rating: 5,
        status: "Want to Watch",
        coverUrl: "",
        notes: "",
      });
      setIsAddingFav(false);
    }
  };

  const updateFavorite = () => {
    if (editingFav && newFav.title && newFav.creator) {
      const updatedFav = {
        ...editingFav,
        title: newFav.title,
        creator: newFav.creator,
        year: newFav.year,
        description: newFav.description,
        category: newFav.category,
        tags: newFav.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        rating: parseInt(newFav.rating),
        status: newFav.status,
        coverUrl: newFav.coverUrl,
        notes: newFav.notes,
      };
      favServices.update(editingFav.id, updatedFav);

      setFavorites(
        favorites.map((fav) => (fav.id === editingFav.id ? updatedFav : fav))
      );
      setEditingFav(null);
      setNewFav({
        title: "",
        creator: "",
        year: "",
        description: "",
        category: "Movies",
        tags: "",
        rating: 5,
        status: "Want to Watch",
        coverUrl: "",
        notes: "",
      });
    }
  };

  const deleteFavorite = (id) => {
    favServices.remove(id);
    setFavorites(favorites.filter((fav) => fav.id !== id));
  };

  const startEdit = (favorite) => {
    setEditingFav(favorite);
    setNewFav({
      title: favorite.title,
      creator: favorite.creator,
      year: favorite.year,
      description: favorite.description,
      category: favorite.category,
      tags: favorite.tags.join(", "),
      rating: favorite.rating,
      status: favorite.status,
      coverUrl: favorite.coverUrl || "",
      notes: favorite.notes || "",
    });
  };

  const cancelForm = () => {
    setIsAddingFav(false);
    setEditingFav(null);
    setNewFav({
      title: "",
      creator: "",
      year: "",
      description: "",
      category: "Movies",
      tags: "",
      rating: 5,
      status: "Want to Watch",
      coverUrl: "",
      notes: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Watching":
      case "Reading":
        return "bg-blue-100 text-blue-800";
      case "Want to Watch":
      case "Want to Read":
        return "bg-purple-100 text-purple-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      case "Dropped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-600">
          {rating}/10
        </span>
      </div>
    );
  };

  const FavoriteCard = ({ favorite }) => {
    const IconComponent = categoryIcons[favorite.category] || Film;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <IconComponent size={20} className="text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">
                {favorite.title}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                by {favorite.creator}
              </p>
              {favorite.year && (
                <p className="text-xs text-gray-500">{favorite.year}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={() => startEdit(favorite)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => deleteFavorite(favorite.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
              favorite.status
            )}`}
          >
            {favorite.status}
          </span>
          <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {favorite.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {favorite.description}
        </p>

        <div className="mb-4">{renderStars(favorite.rating)}</div>

        {favorite.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {favorite.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {favorite.notes && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-700 italic">"{favorite.notes}"</p>
          </div>
        )}
      </div>
    );
  };

  const getStatsData = () => {
    const stats = {
      total: favorites.length,
      completed: favorites.filter((f) => f.status === "Completed").length,
      watching: favorites.filter(
        (f) => f.status.includes("Watch") || f.status.includes("Read")
      ).length,
      avgRating:
        favorites.length > 0
          ? (
              favorites.reduce((sum, f) => sum + f.rating, 0) / favorites.length
            ).toFixed(1)
          : 0,
    };
    return stats;
  };

  const stats = getStatsData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white">
                {/* <Heart className="text-white" size={24} /> */}
                <img src={icon} alt="Icon" width="50" height="50" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  FavVault
                </h1>
                <p className="text-sm text-gray-600">
                  Your personal media collection
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddingFav(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              <span>Add Media</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <BookOpen className="text-purple-600" size={20} />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
                <p className="text-sm text-gray-600">Total Items</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <Award className="text-green-600" size={20} />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.completed}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <Clock className="text-blue-600" size={20} />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.watching}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-600" size={20} />
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.avgRating}
                </p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search your collection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
              <option value="title">A-Z</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {(isAddingFav || editingFav) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingFav ? "Edit Media" : "Add New Media"}
                </h3>
                <button
                  onClick={cancelForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title *"
                  value={newFav.title}
                  onChange={(e) =>
                    setNewFav({ ...newFav, title: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />

                <input
                  type="text"
                  placeholder="Creator/Author/Director *"
                  value={newFav.creator}
                  onChange={(e) =>
                    setNewFav({ ...newFav, creator: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />

                <div className="flex space-x-4">
                  <select
                    value={newFav.category}
                    onChange={(e) =>
                      setNewFav({
                        ...newFav,
                        category: e.target.value,
                        status: statusOptions[e.target.value][0],
                      })
                    }
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categories
                      .filter((cat) => cat !== "All")
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Year"
                    value={newFav.year}
                    onChange={(e) =>
                      setNewFav({ ...newFav, year: e.target.value })
                    }
                    className="w-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <textarea
                  placeholder="Description"
                  value={newFav.description}
                  onChange={(e) =>
                    setNewFav({ ...newFav, description: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-20 resize-none"
                />

                <div className="flex space-x-4">
                  <select
                    value={newFav.status}
                    onChange={(e) =>
                      setNewFav({ ...newFav, status: e.target.value })
                    }
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {statusOptions[newFav.category].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating: {newFav.rating}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newFav.rating}
                      onChange={(e) =>
                        setNewFav({ ...newFav, rating: e.target.value })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={newFav.tags}
                  onChange={(e) =>
                    setNewFav({ ...newFav, tags: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />

                <textarea
                  placeholder="Personal notes..."
                  value={newFav.notes}
                  onChange={(e) =>
                    setNewFav({ ...newFav, notes: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-16 resize-none"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={editingFav ? updateFavorite : addFavorite}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {editingFav ? "Update" : "Add"} Media
                </button>
                <button
                  onClick={cancelForm}
                  className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Media Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {filteredAndSortedFavorites.length} item
              {filteredAndSortedFavorites.length !== 1 ? "s" : ""}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </h2>
          </div>

          {filteredAndSortedFavorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={40} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {searchTerm
                  ? "No media found"
                  : "No media in your collection yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start building your personal media library"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsAddingFav(true)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Your First Item
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedFavorites.map((favorite) => (
                <FavoriteCard key={favorite.id} favorite={favorite} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
