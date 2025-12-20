import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GroupList from "../components/GroupList";
import * as api from "../api";
import { motion } from "framer-motion";

export default function GroupsPage({ users, currentUser, onRemoveMember }) {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, [currentUser]);

  const loadGroups = async () => {
    try {
      const data = currentUser
        ? await api.getUserGroups(currentUser)
        : await api.getGroups();
      setGroups(data);
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  const handleCreateGroup = async (name, members) => {
    if (!currentUser) {
      alert("Please select a user first");
      return;
    }
    try {
      await api.createGroup(name, currentUser, members);
      await loadGroups();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSelectGroup = (group) => {
    navigate(`/groups/${group.id}`);
  };

  const handleRemoveMember = async (groupId, userId) => {
    await onRemoveMember(groupId, userId);
    await loadGroups();
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await api.deleteGroup(groupId);
      await loadGroups();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <GroupList
        groups={groups}
        users={users}
        currentUser={currentUser}
        onSelectGroup={handleSelectGroup}
        onCreateGroup={handleCreateGroup}
        onRemoveMember={handleRemoveMember}
        onDeleteGroup={handleDeleteGroup}
      />
    </motion.div>
  );
}
