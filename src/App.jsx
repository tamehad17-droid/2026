import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Routes from "./Routes";
import WhatsAppButton from './components/ui/WhatsAppButton';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes />
        <WhatsAppButton />
      </div>
    </AuthProvider>
  );
}

export default App;