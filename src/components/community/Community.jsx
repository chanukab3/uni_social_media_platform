/* function Community() {
    return ( 
        <>
        <h2>Community Page</h2>
        </>
     );
}
*/


import { useState } from "react";
import "./Community.css";

const initialCommunities = [
  {
    id: 1,
    name: "Programming Club",
    category: "Technology",
    memberNames: [
      "Alex Perera",
      "Sarah Fernando",
      "Kavindu Silva",
      "Nethmi Jayasuriya",
      "Daniel Kumar",
      "Maya Silva",
    ],
    createdBy: "current-user",
  },
  {
    id: 2,
    name: "University Friends",
    category: "Social",
    memberNames: ["Sarah Fernando", "Alex Perera"],
    createdBy: "user-2",
  },
  {
    id: 3,
    name: "Gaming Community",
    category: "Entertainment",
    memberNames: ["Kavindu Silva", "Daniel Kumar"],
    createdBy: "user-3",
  },
];

const sampleFriends = [
  { id: 101, name: "Alex Perera" },
  { id: 102, name: "Sarah Fernando" },
  { id: 103, name: "Kavindu Silva" },
  { id: 104, name: "Nethmi Jayasuriya" },
  { id: 105, name: "Daniel Kumar" },
];

function Community() {
  const [communities, setCommunities] = useState(initialCommunities);
  const [activeView, setActiveView] = useState("world");
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const [friends, setFriends] = useState(sampleFriends);
const [friendSearch, setFriendSearch] = useState("");
const [selectedFriends, setSelectedFriends] = useState([]);

const [showChatMenu, setShowChatMenu] = useState(false);

//adding friends to community
const filteredFriends = friends.filter((friend) =>
  friend.name.toLowerCase().includes(friendSearch.toLowerCase())
);

function toggleFriend(friendId) {
  setSelectedFriends((previous) =>
    previous.includes(friendId)
      ? previous.filter((id) => id !== friendId)
      : [...previous, friendId]
  );
}

  function createCommunity(event) {
    event.preventDefault();

    if (!groupName.trim()) return;

    const newCommunity = {
      id: Date.now(),
      name: groupName.trim(),
      category,
      description: description.trim(),
      memberIds: selectedFriends,
    };

    setCommunities((previous) => [...previous, newCommunity]);
    setSelectedCommunity(newCommunity);
    setActiveView("group");

    setGroupName("");
    setDescription("");
    setCategory("Technology");
    setSelectedFriends([]);
setFriendSearch("");
  }

  function leaveGroup() {
  if (!selectedCommunity) return;

  const confirmed = window.confirm(
    `Are you sure you want to leave "${selectedCommunity.name}"?`
  );

  if (!confirmed) return;

  setCommunities((previous) =>
    previous.filter((community) => community.id !== selectedCommunity.id)
  );

  setSelectedCommunity(null);
  setActiveView("world");
  setShowChatMenu(false);
}

function deleteGroup() {
  if (!selectedCommunity) return;

  if (selectedCommunity.createdBy !== "current-user") {
    return;
  }

  const confirmed = window.confirm(
    `Delete "${selectedCommunity.name}" for everyone? This cannot be undone.`
  );

  if (!confirmed) return;

  setCommunities((previous) =>
    previous.filter((community) => community.id !== selectedCommunity.id)
  );

  setSelectedCommunity(null);
  setActiveView("world");
  setShowChatMenu(false);
}

  function sendMessage(event) {
    event.preventDefault();

    if (!messageText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: messageText.trim(),
      chatId:
        activeView === "group"
          ? `group-${selectedCommunity.id}`
          : "world",
    };

    setMessages((previous) => [...previous, newMessage]);
    setMessageText("");
  }



  const currentChatId =
    activeView === "group" && selectedCommunity
      ? `group-${selectedCommunity.id}`
      : "world";

  const currentMessages = messages.filter(
    (message) => message.chatId === currentChatId
  );

  return (
    <div className="community-page">
      
      <aside className="community-sidebar">
        <h2>Communities</h2>

        <button
          className="primary-button"
          onClick={() => setActiveView("create")}
        >
          + Create Community
        </button>



        <h3>Joined Groups</h3>

        <div className="community-list">
          {communities.map((community) => (
            <button
              key={community.id}
              className={`community-item ${
                selectedCommunity?.id === community.id &&
                activeView === "group"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setSelectedCommunity(community);
                setActiveView("group");
              }}
            >
              <span className="community-avatar">
                {community.name.charAt(0).toUpperCase()}
              </span>

              <span>{community.name}</span>
            </button>
          ))}
    
        </div>
      </aside>

      {/* MIDDLE COLUMN */}
<main className="community-main">
  {activeView === "create" && (
    <section className="content-card">
      <h1>Create a Community</h1>

      <form onSubmit={createCommunity} className="community-form">
        <label htmlFor="groupName">Community name</label>
        <input
          id="groupName"
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
          placeholder="Enter community name"
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Enter description"
          rows={4}
        />

        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option>Technology</option>
          <option>Education</option>
          <option>Social</option>
          <option>Entertainment</option>
          <option>Sports</option>
          <option>Other</option>
        </select>

        <div className="friend-picker">
  <label htmlFor="friendSearch">Add friends</label>

  <input
    id="friendSearch"
    type="search"
    placeholder="Search friends..."
    value={friendSearch}
    onChange={(event) => setFriendSearch(event.target.value)}
  />

  <p className="muted-text">
    {selectedFriends.length} friend(s) selected
  </p>

  <div className="friend-list">
    {filteredFriends.map((friend) => {
      const isSelected = selectedFriends.includes(friend.id);

      return (
        <button
          key={friend.id}
          type="button"
          className={`friend-item ${isSelected ? "selected" : ""}`}
          onClick={() => toggleFriend(friend.id)}
        >
          <span className="friend-avatar">
            {friend.name.charAt(0)}
          </span>

          <span>{friend.name}</span>

          <span className="friend-check">
            {isSelected ? "✓" : "+"}
          </span>
        </button>
      );
    })}

    {filteredFriends.length === 0 && (
      <p className="muted-text">No friends found.</p>
    )}
  </div>
</div>
        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setActiveView("world")}
          >
            Cancel
          </button>

          <button type="submit" className="primary-button">
            Create Community
          </button>
        </div>
      </form>
    </section>
  )}
</main>


      {/* RIGHT COLUMN */}
      <div className="chat-section">
      <aside className="chat-panel">
        <div className="chat-header">
<div className="chat-header">
  <div className="chat-header-info">
    <h3>
      {activeView === "group" && selectedCommunity
        ? selectedCommunity.name
        : activeView === "world"
          ? "World Chat"
          : "Inbox"}
    </h3>

    {activeView === "group" && selectedCommunity && (
<p className="recent-friends">
  {selectedCommunity.memberNames?.slice(-5).reverse().map((name) => name.split(" ")[0]).join(",") ||
    "No members yet"}
</p>
    )}
  </div>

  {activeView === "group" && selectedCommunity && (
    <div className="chat-menu-container">
      <button
        type="button"
        className="chat-menu-button"
        onClick={() => setShowChatMenu((previous) => !previous)}
        aria-label="Chat options"
      >
        ⋮
      </button>

      {showChatMenu && (
        <div className="chat-menu">
          <button
            type="button"
            onClick={() => {
              setShowChatMenu(false);
              //Connect to the main search.
            }}
          >
            Add friends
          </button>

<button
  type="button"
  onClick={leaveGroup}
>
  Leave group
</button>

          {selectedCommunity.createdBy === "current-user" && (
            <button
              type="button"
              className="delete-group-option"
              onClick={deleteGroup}
            >
              Delete group
            </button>
          )}
        </div>
      )}
    </div>
  )}
</div>
        </div>

        {activeView === "inbox" ? (
          <div className="empty-chat">
            <span className="empty-icon">✉</span>
            <h3>Your conversations</h3>
            <p className="muted-text">
              Your previous friend chats will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="message-list">
              {currentMessages.length === 0 ? (
                <div className="empty-chat">
                  <span className="empty-icon">💬</span>
                  <h3>Start a conversation</h3>
                  <p className="muted-text">
                    Be the first to send a message.
                  </p>
                </div>
              ) : (
                currentMessages.map((message) => (
                  <div className="message-bubble" key={message.id}>
                    {message.text}
                  </div>
                ))
              )}
            </div>

            <form className="message-form" onSubmit={sendMessage}>
              <input
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Write a message..."
                aria-label="Write a message"
              />

              <button type="submit" className="send-button">
                Send
              </button>
            </form>
          </>
        )}
      </aside>
      <div className="chat-navigation">
    <button
      className={`secondary-button ${
        activeView === "inbox" ? "active" : ""
      }`}
      onClick={() => setActiveView("inbox")}
    >
      Inbox
    </button>

    <button
      className={`secondary-button ${
        activeView === "world" ? "active" : ""
      }`}
      onClick={() => setActiveView("world")}
    >
      World Chat
    </button>
  </div>
</div>
    </div>
  );
}
export default Community;
