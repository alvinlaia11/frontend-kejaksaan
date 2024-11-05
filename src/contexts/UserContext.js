import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem('userAvatar') || null;
  });

  const updateAvatar = (newAvatarUrl) => {
    setUserAvatar(newAvatarUrl);
    if (newAvatarUrl) {
      localStorage.setItem('userAvatar', newAvatarUrl);
    } else {
      localStorage.removeItem('userAvatar');
    }
  };

  const clearAvatar = () => {
    setUserAvatar(null);
    localStorage.removeItem('userAvatar');
  };

  return (
    <UserContext.Provider value={{ userAvatar, updateAvatar, clearAvatar }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 