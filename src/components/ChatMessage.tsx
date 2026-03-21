interface Props {
  senderName: string;
  content: string;
  isHuman: boolean;
  avatarColor: string;
  avatarBg: string;
  initial: string;
  type: 'statement' | 'system' | 'vote' | 'night';
}

export function ChatMessageBubble({ senderName, content, isHuman, avatarColor, avatarBg, initial, type }: Props) {
  if (type === 'system') {
    return (
      <div className="chat-system">
        <span className="system-text">{content}</span>
      </div>
    );
  }

  return (
    <div className={`chat-row ${isHuman ? 'chat-right' : 'chat-left'}`}>
      {!isHuman && (
        <div className="chat-avatar" style={{ background: avatarBg, color: avatarColor }}>
          {initial}
        </div>
      )}
      <div className="chat-content">
        {!isHuman && <span className="chat-name">{senderName}</span>}
        <div className={`chat-bubble ${isHuman ? 'bubble-human' : 'bubble-ai'} ${type === 'vote' ? 'bubble-vote' : ''}`}>
          {content}
        </div>
      </div>
      {isHuman && (
        <div className="chat-avatar" style={{ background: avatarBg, color: avatarColor }}>
          {initial}
        </div>
      )}
    </div>
  );
}
