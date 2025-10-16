### Voice Button
```css
.voice-button {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--herb-primary), var(--herb-secondary));
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}

.voice-button:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(76, 175, 80, 0.4);
}

.voice-button:active {
  transform: scale(0.95);
}

.voice-button.listening {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---
