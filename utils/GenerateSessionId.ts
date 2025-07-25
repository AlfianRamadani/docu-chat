import React from 'react';

export default async function GenerateSessionId() {
  const sessionName = 'docu-chat-user';
  const randomId = new Date().getTime() + '-' + Math.random().toString(36).substring(2);
  const sessionId = `${sessionName}-${randomId}`;
  return sessionId;
}
