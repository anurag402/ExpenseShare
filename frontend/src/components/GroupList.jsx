import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaUsers, FaChevronRight, FaMinus, FaCross, FaCut, FaSearch, FaUserPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  hover: { y: -5, transition: { duration: 0.3 } },
};

export default function GroupList({
  groups,
  users,
  onSelectGroup,
  onCreateGroup,
  currentUser,
  onRemoveMember,
  onDeleteGroup,
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    onCreateGroup(data.name, selectedMembers);
    reset();
    setSelectedMembers([]);
    setMemberSearch("");
    setShowForm(false);
    toast.success("Group created successfully!");
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDelete = (groupId, groupName) => {
    if (confirm(`Are you sure you want to delete "${groupName}"?`)) {
      onDeleteGroup(groupId);
      toast.success("🗑️ Group deleted!");
    }
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Your Groups
          </h2>
          <p className="text-gray-400 mt-1">{groups.length} groups total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          disabled={!currentUser}
          className="px-6 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold rounded-lg flex items-center gap-2 hover:bg-blue-500/30 hover:border-blue-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showForm ? "Cancel" : <><FaPlus /> New Group</>}
        </motion.button>

      </motion.div>

      {/* Create Group Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="mb-8 p-6 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Group Name
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="e.g., Trip to Paris"
                  {...register("name", { required: "Group name is required" })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                  <FaUserPlus className="text-blue-400" />
                  Add Members
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  {selectedMembers.length > 0 
                    ? `${selectedMembers.length} member(s) selected`
                    : "Click on users below to select them"}
                </p>
                
                {/* Search Input */}
                <div className="mb-3 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                {/* User List */}
                <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto overflow-x-visible px-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {users
                    .filter((u) => u.id !== currentUser)
                    .filter(user => 
                      user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                      user.email.toLowerCase().includes(memberSearch.toLowerCase())
                    )
                    .map((user) => {
                    const isSelected = selectedMembers.includes(user.id);
                    return (
                      <motion.div
                        key={user.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toggleMemberSelection(user.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-white/30'
                          }`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">
                              {user.name} <span className="text-xs text-gray-400 font-normal">({user.email})</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50 transition-all"
              >
                Create Group
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            👥
          </motion.div>
          <p className="text-gray-400 text-lg">
            No groups yet. Create one to get started!
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {groups.sort((a, b) => a.name.localeCompare(b.name)).map((group) => (
              <motion.div
                key={group.id}
                variants={cardVariants}
                whileHover="hover"
                exit="exit"
                onClick={() => onSelectGroup(group)}
                className="group cursor-pointer"
              >
                <div className="h-full p-6 rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 hover:border-white/40 transition-all overflow-hidden relative">
                  {/* Background gradient on hover */}
                  <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10">
                    {/* Top Section */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          className="text-2xl text-blue-400"
                        >
                          <FaUsers />
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-white text-lg">
                            {group.name}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {group.members.length} members
                          </p>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(group.id, group.name);
                        }}
                        className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-all"
                        title="Delete group"
                      >
                        <FaTrash size={16} />
                      </motion.button>
                    </div>

                    {/* Members Section */}
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <p className="text-xs font-semibold text-gray-400 mb-2">
                        MEMBERS
                      </p>
                      <div className="space-y-1">
                        {group.members.slice(0, 3).map((memberId) => {
                          const member = users.find((u) => u.id === memberId);
                          return member ? (
                            <div
                              key={memberId}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-300">
                                {member.name}
                                {memberId === group.createdBy && (
                                  <span className="ml-1 text-xs text-blue-400">
                                    (Creator)
                                  </span>
                                )}
                              </span>
                              {memberId !== group.createdBy && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveMember(group.id, memberId);
                                    toast.info("Member removed");
                                  }}
                                  className="text-xs px-2 py-1 text-red-400 hover:bg-red-600/20 rounded transition-all"
                                >
                                  Remove
                                </motion.button>
                              )}
                            </div>
                          ) : null;
                        })}
                        {group.members.length > 3 && (
                          <p className="text-xs text-gray-500 pt-1">
                            +{group.members.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <motion.div
                      className="flex items-center justify-between text-blue-400 group-hover:text-blue-300 transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-sm font-semibold">
                        View Details
                      </span>
                      <FaChevronRight size={14} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
