import { motion } from "framer-motion";
import { FaTrash, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const userVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export default function UsersPage({
  users,
  currentUser,
  onCreateUser,
  onDeleteUser,
}) {
  const handleDelete = (userId, userName) => {
    if (confirm(`Delete ${userName}?`)) {
      onDeleteUser(userId);
      toast.success("🗑️ User deleted!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Users
        </h1>
        <p className="text-gray-400">{users.length} total users</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {users.length === 0 ? (
          <motion.div
            className="col-span-full text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-5xl mb-4">👤</div>
            <p className="text-gray-400 text-lg">No users yet</p>
          </motion.div>
        ) : (
          users.sort((a, b) => a.name.localeCompare(b.name)).map((user) => (
            <motion.div
              key={user.id}
              variants={userVariants}
              whileHover={{ y: -4 }}
              className="p-6 rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 hover:border-white/40 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="text-3xl text-blue-400 p-3 bg-blue-600/20 rounded-lg"
                  >
                    <FaUser />
                  </motion.div>

                  <div className="flex-1">
                    <p className="font-semibold text-white text-lg">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    {user.id === currentUser && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block mt-2 text-xs text-blue-400 font-semibold bg-blue-600/20 px-3 py-1 rounded-full"
                      >
                        👤 You
                      </motion.span>
                    )}
                  </div>
                </div>

                {user.id !== currentUser && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(user.id, user.name)}
                    className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-all"
                    title="Delete user"
                  >
                    <FaTrash size={16} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
