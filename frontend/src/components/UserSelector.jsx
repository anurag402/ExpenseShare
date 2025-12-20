import { useState } from "react";
import { useForm } from "react-hook-form";

export default function UserSelector({
  users,
  onUserChange,
  currentUser,
  onCreateUser,
  onDeleteUser,
}) {
  const [showForm, setShowForm] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    onCreateUser(data.name, data.email);
    reset();
    setShowForm(false);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Current User
      </label>
      <div className="flex gap-2">
        <select
          value={currentUser || ""}
          onChange={(e) => onUserChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          {showForm ? "Cancel" : "New User"}
        </button>
      </div>

      {showForm && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Create New User</h3>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex gap-2 flex-col"
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Name"
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User List with Delete Button */}
      {users.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">All Users</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={() => onDeleteUser(user.id)}
                  className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 text-red-300 rounded hover:bg-red-500/30 hover:border-red-400/50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
