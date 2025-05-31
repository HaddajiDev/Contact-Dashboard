import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

type MessageItem = {
    id: string
    name: string
    email: string
    message: string
    timestamp: string
    isRead: boolean
    isStarred: boolean
    isArchived: boolean
    isDeleted: boolean
    priority: "high" | "medium" | "low"
};

type MessageState = {
  all: MessageItem[];
  loading: boolean;
  error: string | null;
};

const initialState: MessageState = {
  all: [],
  loading: false,
  error: null,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch all messages
export const fetchMessages = createAsyncThunk(
  "message/fetch",
  async () => {
    const response = await axios.get(`${API_URL}/api/all`);
    return response.data.messages.map((msg: any) => ({
      id: msg._id,
      name: msg.name,
      email: msg.email,
      message: msg.message,
      timestamp: msg.timestamp || msg.createdAt,
      isRead: msg.isRead || false,
      isStarred: msg.isStarred || false,
      isArchived: msg.isArchived || false,
      isDeleted: msg.isDeleted || false,
      priority: msg.priority || "medium",
    }));
  }
);

// Create new message
export const createMessage = createAsyncThunk(
  "message/create",
  async (messageData: { name: string; email: string; message: string; priority: "high" | "medium" | "low" }) => {
    const response = await axios.post(`${API_URL}/api/new`, messageData);
    return response.data;
  }
);

// Permanent delete message
export const deleteMessage = createAsyncThunk(
  "message/delete",
  async (id: string) => {
    await axios.delete(`${API_URL}/api/delete`, {
      data: { id }
    });
    return id;
  }
);

// Mark message as read
export const markAsRead = createAsyncThunk(
  "message/markAsRead",
  async (id: string) => {
    await axios.patch(`${API_URL}/api/read`, { id });
    return id;
  }
);

// Archive message
export const archiveMessage = createAsyncThunk(
  "message/archive",
  async (id: string) => {
    await axios.patch(`${API_URL}/api/archive`, { id });
    return id;
  }
);

// Unarchive message
export const unarchiveMessage = createAsyncThunk(
  "message/unarchive",
  async (id: string) => {
    await axios.patch(`${API_URL}/api/unarchive`, { id });
    return id;
  }
);

// Star message
export const starMessage = createAsyncThunk(
  "message/star",
  async (id: string) => {
    await axios.patch(`${API_URL}/api/star`, { id });
    return id;
  }
);

// Unstar message
export const unstarMessage = createAsyncThunk(
  "message/unstar",
  async (id: string) => {
    await axios.patch(`${API_URL}/api/unstar`, { id });
    return id;
  }
);

// Soft delete message (mark as deleted)
export const softDeleteMessage = createAsyncThunk(
  "message/softDelete",
  async (id: string) => {
    await axios.patch(`${API_URL}/api/delete`, { id });
    return id;
  }
);

// Restore message (undelete)
export const restoreMessage = createAsyncThunk(
  "message/restore",
  async (id: string) => {
    await axios.patch(`${API_URL}/api/restore`, { id });
    return id;
  }
);

// Permanent delete for individual messages
export const permanentDeleteMessage = createAsyncThunk(
  "message/permanentDelete",
  async (id: string) => {
    await axios.delete(`${API_URL}/api/delete`, { data: { id } });
    return id;
  }
);

// Delete all messages in trash (permanently)
export const deleteAllTrashMessages = createAsyncThunk(
  "message/deleteAllTrash",
  async (_, { getState }) => {
    const state = getState() as { message: MessageState };
    const trashMessageIds = state.message.all
      .filter(msg => msg.isDeleted)
      .map(msg => msg.id);
    
    // Delete each message permanently
    await Promise.all(
      trashMessageIds.map(id => 
        axios.delete(`${API_URL}/api/delete`, { data: { id } })
      )
    );
    
    return trashMessageIds;
  }
);

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    // Local state updates without API calls
    toggleRead: (state, action) => {
      const message = state.all.find(msg => msg.id === action.payload);
      if (message) {
        message.isRead = !message.isRead;
      }
    },
    toggleStar: (state, action) => {
      const message = state.all.find(msg => msg.id === action.payload);
      if (message) {
        message.isStarred = !message.isStarred;
      }
    },
    toggleArchive: (state, action) => {
      const message = state.all.find(msg => msg.id === action.payload);
      if (message) {
        message.isArchived = !message.isArchived;
      }
    },
    toggleDelete: (state, action) => {
      const message = state.all.find(msg => msg.id === action.payload);
      if (message) {
        message.isDeleted = !message.isDeleted;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.all = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch messages";
      })
      
      // Create message
      .addCase(createMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.all.unshift(action.payload);
        }
      })
      .addCase(createMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create message";
      })
      
      // Delete message (permanent)
      .addCase(deleteMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.all = state.all.filter(msg => msg.id !== action.payload);
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete message";
      })
      
      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const message = state.all.find(msg => msg.id === action.payload);
        if (message) {
          message.isRead = true;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.error.message || "Failed to mark message as read";
      })
      
      // Archive message
      .addCase(archiveMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(archiveMessage.fulfilled, (state, action) => {
        const message = state.all.find(msg => msg.id === action.payload);
        if (message) {
          message.isArchived = true;
        }
      })
      .addCase(archiveMessage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to archive message";
      })
      
      // Unarchive message
      .addCase(unarchiveMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(unarchiveMessage.fulfilled, (state, action) => {
        const message = state.all.find(msg => msg.id === action.payload);
        if (message) {
          message.isArchived = false;
        }
      })
      .addCase(unarchiveMessage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to unarchive message";
      })
      
      // Star message
      .addCase(starMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(starMessage.fulfilled, (state, action) => {
        const message = state.all.find(msg => msg.id === action.payload);
        if (message) {
          message.isStarred = true;
        }
      })
      .addCase(starMessage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to star message";
      })
      
      // Unstar message
      .addCase(unstarMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(unstarMessage.fulfilled, (state, action) => {
        const message = state.all.find(msg => msg.id === action.payload);
        if (message) {
          message.isStarred = false;
        }
      })
      .addCase(unstarMessage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to unstar message";
      })
      
      // Soft delete message
      .addCase(softDeleteMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(softDeleteMessage.fulfilled, (state, action) => {
        const message = state.all.find(msg => msg.id === action.payload);
        if (message) {
          message.isDeleted = true;
        }
      })
      .addCase(softDeleteMessage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to soft delete message";
      })
      
      // Restore message
      .addCase(restoreMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(restoreMessage.fulfilled, (state, action) => {
        const message = state.all.find(msg => msg.id === action.payload);
        if (message) {
          message.isDeleted = false;
        }
      })
      .addCase(restoreMessage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to restore message";
      })
      
      // Permanent delete message
      .addCase(permanentDeleteMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(permanentDeleteMessage.fulfilled, (state, action) => {
        state.all = state.all.filter(msg => msg.id !== action.payload);
      })
      .addCase(permanentDeleteMessage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete message permanently";
      })
      
      // Delete all trash messages
      .addCase(deleteAllTrashMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAllTrashMessages.fulfilled, (state, action) => {
        state.loading = false;
        // Remove all deleted message IDs from the state
        state.all = state.all.filter(msg => !action.payload.includes(msg.id));
      })
      .addCase(deleteAllTrashMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete all trash messages";
      });
  },
});

export const { toggleRead, toggleStar, toggleArchive, toggleDelete, clearError } = messageSlice.actions;
export default messageSlice.reducer;