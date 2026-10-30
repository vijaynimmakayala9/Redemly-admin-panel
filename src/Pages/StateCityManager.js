import { useState, useEffect, useCallback } from "react";
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaCheck, FaTimes,
  FaMapMarkerAlt, FaCity, FaSearch, FaSync,
} from "react-icons/fa";

const BASE_URL = "https://api.redemly.com/api/states";

export default function StateCityManager() {
  /* ------------------------------- state -------------------------------- */
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");

  // create / edit state modal
  const [stateModal, setStateModal] = useState(false);
  const [editingState, setEditingState] = useState(null); // null => create
  const [stateForm, setStateForm] = useState({ name: "", cities: [] });
  const [cityInput, setCityInput] = useState("");

  // cities drawer/modal
  const [citiesModal, setCitiesModal] = useState(false);
  const [activeState, setActiveState] = useState(null);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);

  /* ------------------------------ helpers ------------------------------- */
  const token = localStorage.getItem("adminToken"); // if your API needs auth

  const flash = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccess("");
    } else {
      setSuccess(msg);
      setError("");
    }
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4000);
  };

  /* ------------------------------ fetching ------------------------------ */
  const fetchStates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(BASE_URL, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Failed to load states (${res.status})`);
      const json = await res.json();
      setStates(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  const fetchCities = async (state) => {
    setCitiesLoading(true);
    setCities([]);
    setSelectedCities([]);
    try {
      const res = await fetch(`${BASE_URL}/${state._id}/cities`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (!res.ok || json.success === false)
        throw new Error(json.message || "Failed to load cities");
      setCities(json.cities || []);
    } catch (err) {
      flash(err.message, true);
    } finally {
      setCitiesLoading(false);
    }
  };

  /* --------------------------- STATE: create ---------------------------- */
  const openCreateState = () => {
    setEditingState(null);
    setStateForm({ name: "", cities: [] });
    setCityInput("");
    setStateModal(true);
  };

  const addCityToForm = () => {
    const val = cityInput.trim();
    if (!val) return;
    if (stateForm.cities.includes(val)) {
      setCityInput("");
      return;
    }
    setStateForm((p) => ({ ...p, cities: [...p.cities, val] }));
    setCityInput("");
  };

  const removeCityFromForm = (city) => {
    setStateForm((p) => ({ ...p, cities: p.cities.filter((c) => c !== city) }));
  };

  const handleSaveState = async () => {
    if (!stateForm.name.trim()) return flash("State name is required", true);
    setActionLoading(true);
    try {
      const isEdit = !!editingState;
      const url = isEdit ? `${BASE_URL}/${editingState._id}` : BASE_URL;
      const body = {
        name: stateForm.name.trim(),
        ...(stateForm.cities.length ? { cities: stateForm.cities } : {}),
      };
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || json.success === false)
        throw new Error(json.message || "Request failed");

      flash(isEdit ? "State updated successfully" : "State created successfully");
      setStateModal(false);
      setEditingState(null);
      await fetchStates();
    } catch (err) {
      flash(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------------------- STATE: edit ----------------------------- */
  const openEditState = (state) => {
    setEditingState(state);
    setStateForm({ name: state.name, cities: [...(state.cities || [])] });
    setCityInput("");
    setStateModal(true);
  };

  /* --------------------------- STATE: delete ---------------------------- */
  const handleDeleteState = async (state) => {
    if (
      !window.confirm(
        `Delete state "${state.name}" and all its cities? This cannot be undone.`
      )
    )
      return;
    setActionLoading(true);
    try {
      const res = await fetch(BASE_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stateId: state._id }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false)
        throw new Error(json.message || "Failed to delete state");
      flash("State deleted successfully");
      await fetchStates();
    } catch (err) {
      flash(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  /* --------------------------- CITIES: manage --------------------------- */
  const openCities = async (state) => {
    setActiveState(state);
    setCitiesModal(true);
    await fetchCities(state);
  };

  const handleAddCity = async () => {
    const val = newCity.trim();
    if (!val) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/${activeState._id}/cities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ city: val }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false)
        throw new Error(json.message || "Failed to add city");
      setNewCity("");
      setCities(json.data?.cities || []);
      flash(`City "${val}" added`);
      await fetchStates(); // keep counts in sync
    } catch (err) {
      flash(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCities = async (cityList) => {
    if (!cityList.length) return;
    if (
      !window.confirm(
        `Delete ${cityList.length} city(ies) from ${activeState.name}?`
      )
    )
      return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/city`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          stateId: activeState._id,
          ...(cityList.length === 1 ? { city: cityList[0] } : { cities: cityList }),
        }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false)
        throw new Error(json.message || "Failed to delete city(ies)");
      setSelectedCities([]);
      setCities(json.data?.cities || []);
      flash("City(ies) deleted");
      await fetchStates();
    } catch (err) {
      flash(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAllCities = async () => {
    if (!cities.length) return;
    if (
      !window.confirm(
        `Remove ALL ${cities.length} cities from ${activeState.name}?`
      )
    )
      return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stateId: activeState._id }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false)
        throw new Error(json.message || "Failed to clear cities");
      setCities([]);
      setSelectedCities([]);
      flash("All cities removed");
      await fetchStates();
    } catch (err) {
      flash(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCitySelection = (city) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  /* ------------------------------ derived ------------------------------- */
  const filteredStates = states.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.cities || []).some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCities = states.reduce((acc, s) => acc + (s.cities?.length || 0), 0);

  /* ------------------------------- render ------------------------------- */
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              States &amp; Cities
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage states and the cities that belong to each state.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchStates}
              disabled={loading}
              className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              title="Refresh"
            >
              <FaSync className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={openCreateState}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Add State
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total States" value={states.length} icon={<FaMapMarkerAlt />} color="blue" />
          <StatCard label="Total Cities" value={totalCities} icon={<FaCity />} color="green" />
          <StatCard
            label="States Without Cities"
            value={states.filter((s) => !s.cities?.length).length}
            icon={<FaTimes />}
            color="yellow"
          />
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" onClose={() => setError("")}>{error}</Alert>
        )}
        {success && (
          <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>
        )}

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search states or cities..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>

        {/* States table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["State", "Cities", "Created", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                      <p className="mt-3 text-gray-500">Loading states...</p>
                    </td>
                  </tr>
                ) : filteredStates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No states found.
                    </td>
                  </tr>
                ) : (
                  filteredStates.map((state) => (
                    <tr key={state._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {state.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {state.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {state._id?.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(state.cities || []).slice(0, 3).map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700"
                            >
                              {c}
                            </span>
                          ))}
                          {(state.cities || []).length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                              +{state.cities.length - 3} more
                            </span>
                          )}
                          {(!state.cities || state.cities.length === 0) && (
                            <span className="text-xs text-gray-400">No cities</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {state.createdAt
                          ? new Date(state.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openCities(state)}
                            className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                            title="Manage Cities"
                          >
                            <FaEye size={16} />
                          </button>
                          <button
                            onClick={() => openEditState(state)}
                            className="text-green-600 hover:bg-green-50 p-1.5 rounded"
                            title="Edit State"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteState(state)}
                            disabled={actionLoading}
                            className="text-red-600 hover:bg-red-50 p-1.5 rounded disabled:opacity-50"
                            title="Delete State"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ------------------------ Create/Edit State Modal ------------------------ */}
      {stateModal && (
        <Modal
          title={editingState ? `Edit State — ${editingState.name}` : "Add New State"}
          onClose={() => {
            setStateModal(false);
            setEditingState(null);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State Name *
              </label>
              <input
                value={stateForm.name}
                onChange={(e) =>
                  setStateForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Maharashtra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cities
              </label>
              <div className="flex gap-2">
                <input
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCityToForm();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a city and press Enter / Add"
                />
                <button
                  type="button"
                  onClick={addCityToForm}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  Add
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {stateForm.cities.length === 0 && (
                  <span className="text-sm text-gray-400">No cities added yet.</span>
                )}
                {stateForm.cities.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-sm"
                  >
                    {c}
                    <button
                      onClick={() => removeCityFromForm(c)}
                      className="hover:text-red-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
              {editingState && (
                <p className="mt-2 text-xs text-amber-600">
                  Note: the API merges cities on update. Removing a city here does
                  not delete it — use the Cities manager to delete individual
                  cities.
                </p>
              )}
            </div>
          </div>

          <ModalFooter>
            <button
              onClick={() => {
                setStateModal(false);
                setEditingState(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveState}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading && (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              {editingState ? "Save Changes" : "Create State"}
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* --------------------------- Cities Manager --------------------------- */}
      {citiesModal && activeState && (
        <Modal
          title={`Cities — ${activeState.name}`}
          onClose={() => {
            setCitiesModal(false);
            setActiveState(null);
            setCities([]);
            setSelectedCities([]);
          }}
          wide
        >
          {/* Add city */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCity();
                }
              }}
              placeholder="Add a new city..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddCity}
              disabled={actionLoading || !newCity.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaPlus /> Add City
            </button>
          </div>

          {/* Bulk actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="text-sm text-gray-600">
              {cities.length} city(ies) · {selectedCities.length} selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSelectedCities(
                    selectedCities.length === cities.length ? [] : [...cities]
                  )
                }
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {selectedCities.length === cities.length && cities.length > 0
                  ? "Clear selection"
                  : "Select all"}
              </button>
              <button
                onClick={() => handleDeleteCities(selectedCities)}
                disabled={!selectedCities.length || actionLoading}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
              >
                <FaTrash size={12} /> Delete Selected
              </button>
              <button
                onClick={handleDeleteAllCities}
                disabled={!cities.length || actionLoading}
                className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* City list */}
          <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
            {citiesLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-2 text-gray-500 text-sm">Loading cities...</p>
              </div>
            ) : cities.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaCity className="mx-auto text-3xl text-gray-300" />
                <p className="mt-2">No cities in this state yet.</p>
              </div>
            ) : (
              cities.map((city) => (
                <div
                  key={city}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50"
                >
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city)}
                      onChange={() => toggleCitySelection(city)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">{city}</span>
                  </label>
                  <button
                    onClick={() => handleDeleteCities([city])}
                    disabled={actionLoading}
                    className="text-red-600 hover:bg-red-50 p-1.5 rounded disabled:opacity-50"
                    title="Delete city"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          <ModalFooter>
            <button
              onClick={() => {
                setCitiesModal(false);
                setActiveState(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

/* --------------------------- small UI helpers --------------------------- */
function StatCard({ label, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center gap-4">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function Alert({ type, children, onClose }) {
  const isError = type === "error";
  return (
    <div
      className={`mb-4 p-3 rounded-lg flex items-start gap-3 ${
        isError
          ? "bg-red-50 border border-red-200 text-red-700"
          : "bg-green-50 border border-green-200 text-green-700"
      }`}
    >
      <span className="mt-0.5">
        {isError ? <FaTimes /> : <FaCheck />}
      </span>
      <div className="flex-1 text-sm">{children}</div>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">
        <FaTimes size={12} />
      </button>
    </div>
  );
}

function Modal({ title, children, onClose, wide }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${
          wide ? "max-w-3xl" : "max-w-lg"
        } max-h-[90vh] flex flex-col`}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ children }) {
  return (
    <div className="mt-6 pt-4 border-t flex justify-end gap-2">{children}</div>
  );
}