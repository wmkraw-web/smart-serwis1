import React, { useState, useEffect, useRef } from 'react';
import { Plus, Wrench, Calendar, Info, MessageSquare, Send, Bot, User, Trash2, Cpu, ChevronRight, AlertCircle, Loader2, Coffee, ShieldCheck, ShieldAlert, Zap, List, Edit2, Link as LinkIcon, ExternalLink, Sparkles } from 'lucide-react';

export default function App() {
  const [devices, setDevices] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_serwis_devices');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_serwis_chat');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  
  useEffect(() => {
    localStorage.setItem('smart_serwis_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('smart_serwis_chat', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const [activeTab, setActiveTab] = useState('list');
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  const [editingId, setEditingId] = useState(null);
  const [newDevice, setNewDevice] = useState({ type: '', brand: '', model: '', purchaseDate: '', warrantyMonths: 24, manualUrl: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleAddOrEditDevice = (e) => {
    e.preventDefault();
    if (!newDevice.brand || !newDevice.model) return;
    
    if (editingId) {
      setDevices(devices.map(d => d.id === editingId ? { ...newDevice, id: editingId } : d));
    } else {
      const device = { id: Date.now(), ...newDevice };
      setDevices([...devices, device]);
    }
    resetForm();
  };

  const startEditDevice = (device) => {
    setNewDevice(device);
    setEditingId(device.id);
    setActiveTab('add');
  };

  const deleteDevice = (id) => {
    setDevices(devices.filter(d => d.id !== id));
    setConfirmDeleteId(null);
    
    const newHistory = { ...chatHistory };
    delete newHistory[id];
    setChatHistory(newHistory);
    
    if (selectedDevice?.id === id) {
      setSelectedDevice(null);
      setActiveTab('list');
    }
  };

  const resetForm = () => {
    setNewDevice({ type: '', brand: '', model: '', purchaseDate: '', warrantyMonths: 24, manualUrl: '' });
    setEditingId(null);
    setActiveTab('list');
  };

  const openChat = (device) => {
    setSelectedDevice(device);
    setActiveTab('chat');
  };

  const checkWarranty = (dateString, months) => {
    if (!dateString) return null;
    const purchaseDate = new Date(dateString);
    const expirationDate = new Date(purchaseDate.setMonth(purchaseDate.getMonth() + Number(months)));
    const today = new Date();
    const isExpired = today > expirationDate;
    return { isExpired, expirationDate: expirationDate.toLocaleDateString() };
  };

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col font-sans overflow-hidden">
      <header className="bg-blue-600 text-white shadow-md p-3 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-3 z-10">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
          <h1 className="text-lg sm:text-xl font-bold tracking-wide truncate">AGD/RTV Assistant</h1>
        </div>
        
        <nav className="flex gap-2 w-full sm:w-auto justify-center">
          <button 
            onClick={() => { resetForm(); setActiveTab('list'); }}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-1 px-3 py-2 rounded-md transition-colors text-sm font-medium ${activeTab === 'list' || activeTab === 'chat' ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-400'}`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Urządzenia</span>
          </button>
          <button 
            onClick={() => { resetForm(); setActiveTab('add'); }}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-1 px-3 py-2 rounded-md transition-colors text-sm font-medium ${activeTab === 'add' && !editingId ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-400'}`}
          >
            <Plus className="w-4 h-4" /> 
            <span className="hidden sm:inline">Dodaj</span>
          </button>
          
          <a 
            href="https://buycoffee.to/magiccolor" 
            target="_blank" 
            rel="noopener noreferrer"
            title="Postaw kawę twórcy"
            className="flex items-center justify-center px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-md transition-colors font-medium shadow-sm"
          >
            <Coffee className="w-4 h-4" />
          </a>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-2 sm:p-4 flex gap-6 overflow-hidden relative">
        
        {/* Sidebar z urządzeniami (Desktop) */}
        {activeTab === 'chat' && (
          <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 p-4 hidden md:flex flex-col overflow-y-auto">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2 shrink-0">
              <Cpu className="w-5 h-5 text-blue-500" /> Twój sprzęt
            </h2>
            <div className="flex flex-col gap-2 overflow-y-auto">
              {devices.map(device => (
                <div 
                  key={device.id} 
                  onClick={() => openChat(device)}
                  className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedDevice?.id === device.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-300 hover:bg-slate-50'}`}
                >
                  <div className="font-medium text-slate-800">{device.brand} {device.type}</div>
                  <div className="text-xs text-slate-500">{device.model}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col w-full h-full">
          
          {/* WIDOK: Lista Urządzeń */}
          {activeTab === 'list' && (
            <div className="p-4 sm:p-6 overflow-y-auto h-full relative">
              
              {devices.length === 0 ? (
                // ZMODYFIKOWANA, PIĘKNA STRONA GŁÓWNA
                <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto px-4">
                  <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-6 rounded-3xl shadow-xl mb-8 relative">
                    <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-3 -right-3" />
                    <Bot className="w-16 h-16 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
                    Twój Asystent Domowy
                  </h2>
                  <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                    Zarządzaj swoim sprzętem w jednym miejscu. Zapisuj gwarancje, dodawaj instrukcje i diagnozuj awarie w kilka sekund z pomocą sztucznej inteligencji.
                  </p>
                  <button 
                    onClick={() => { resetForm(); setActiveTab('add'); }} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3 transform hover:-translate-y-1"
                  >
                    <Plus className="w-6 h-6" /> Dodaj pierwsze urządzenie
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Zarządzanie Domowym Sprzętem</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {devices.map(device => (
                      <div key={device.id} className="border border-slate-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow relative group bg-white flex flex-col">
                        
                        {confirmDeleteId === device.id ? (
                          <div className="absolute inset-0 bg-white/95 z-10 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                             <AlertCircle className="w-8 h-8 text-red-500 mb-2"/>
                             <p className="text-sm font-bold text-slate-800 mb-4">Usunąć to urządzenie?</p>
                             <div className="flex gap-2">
                               <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">Anuluj</button>
                               <button onClick={() => deleteDevice(device.id)} className="px-4 py-2 text-xs bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium">Usuń</button>
                             </div>
                          </div>
                        ) : null}

                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              {device.type}
                            </span>
                          </div>
                          
                          <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEditDevice(device)}
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edytuj"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setConfirmDeleteId(device.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Usuń urządzenie"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800">{device.brand}</h3>
                        <p className="text-slate-600 text-sm mb-4">{device.model}</p>
                        
                        <div className="flex-1">
                          <div className="flex items-center text-xs text-slate-500 mb-2 gap-1">
                            <Calendar className="w-3 h-3" /> Kupiono: {device.purchaseDate || 'Brak daty'}
                          </div>
                          
                          {device.purchaseDate && device.warrantyMonths && (
                            <div className="mb-3">
                              {(() => {
                                const warranty = checkWarranty(device.purchaseDate, device.warrantyMonths);
                                if (!warranty) return null;
                                return warranty.isExpired ? (
                                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-red-600 bg-red-50 p-1.5 rounded-md w-fit border border-red-100">
                                    <ShieldAlert className="w-3 h-3" /> Po gwarancji ({warranty.expirationDate})
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-green-700 bg-green-50 p-1.5 rounded-md w-fit border border-green-100">
                                    <ShieldCheck className="w-3 h-3" /> Gwarancja do: {warranty.expirationDate}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {device.manualUrl && (
                             <a href={device.manualUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] sm:text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md w-fit border border-blue-200 mb-4 transition-colors">
                                <ExternalLink className="w-3 h-3" /> Instrukcja PDF / Strona
                             </a>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => openChat(device)}
                          className="w-full mt-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-blue-50 text-blue-700 py-2 rounded-lg transition-colors font-medium text-sm"
                        >
                          <Bot className="w-4 h-4" /> Zapytaj Serwis AI
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* WIDOK: Formularz Dodawania/Edycji */}
          {activeTab === 'add' && (
            <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full overflow-y-auto h-full">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                {editingId ? <Edit2 className="text-blue-500" /> : <Plus className="text-blue-500" />} 
                {editingId ? 'Edytuj urządzenie' : 'Nowe urządzenie'}
              </h2>
              
              <form onSubmit={handleAddOrEditDevice} className="space-y-4 pb-20">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Typ urządzenia (np. Pralka, TV)</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={newDevice.type}
                    onChange={(e) => setNewDevice({...newDevice, type: e.target.value})}
                    placeholder="np. Zmywarka"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Producent (Marka)</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newDevice.brand}
                      onChange={(e) => setNewDevice({...newDevice, brand: e.target.value})}
                      placeholder="np. Samsung"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Model (Numer)</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newDevice.model}
                      onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                      placeholder="np. WW90T534DAE"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data zakupu</label>
                    <input 
                      type="date" 
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={newDevice.purchaseDate}
                      onChange={(e) => setNewDevice({...newDevice, purchaseDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Okres gwarancji (miesiące)</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newDevice.warrantyMonths}
                      onChange={(e) => setNewDevice({...newDevice, warrantyMonths: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-4 h-4 text-slate-400" /> Link do instrukcji (opcjonalnie)
                  </label>
                  <input 
                    type="url" 
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newDevice.manualUrl || ''}
                    onChange={(e) => setNewDevice({...newDevice, manualUrl: e.target.value})}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-slate-500 mt-1">Gdy AI znajdzie link do instrukcji, wklej go tutaj, aby mieć go pod ręką.</p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 mt-4">
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
                  >
                    {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />} 
                    {editingId ? 'Zapisz zmiany' : 'Zapisz w bazie'}
                  </button>
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="w-full sm:w-1/3 px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* WIDOK: Czat z AI */}
          {activeTab === 'chat' && selectedDevice && (
            <ChatInterface 
              device={selectedDevice} 
              history={chatHistory[selectedDevice.id] || []}
              updateHistory={(newMessages) => setChatHistory({...chatHistory, [selectedDevice.id]: newMessages})}
            />
          )}

        </div>
      </main>
    </div>
  );
}

// Komponent Czatu
function ChatInterface({ device, history, updateHistory }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isTyping]);

  useEffect(() => {
    if (history.length === 0) {
      const welcomeMsg = {
        role: 'ai',
        text: `Cześć! Jestem Twoim asystentem technicznym. Widzę, że masz problem z urządzeniem **${device.brand} ${device.model}** (${device.type}). \n\nMogę pomóc Ci znaleźć instrukcję obsługi, rozszyfrować kod błędu lub znaleźć ukryte funkcje serwisowe. W czym mogę pomóc?`,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      updateHistory([welcomeMsg]);
    }
  }, [device.id]);

  const handleClearHistory = () => {
    updateHistory([]);
    setShowClearConfirm(false);
  };

  const callGeminiAPI = async (userText, retries = 5) => {
    // USUNIĘTO SPRAWDZANIE KLUCZA PO STRONIE FRONTENDU!

    const prompt = `
Użytkownik pyta o urządzenie:
Marka: ${device.brand}
Model: ${device.model}
Typ: ${device.type}

Pytanie: ${userText}
`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: "Jesteś ekspertem serwisowym. Twoim zadaniem jest podawanie BEZPOŚREDNICH i KONKRETNYCH odpowiedzi technicznych. Nie odsyłaj użytkownika do wyszukiwarki ani ogólnych stron wsparcia. Jeśli użytkownik pyta o części (np. RAM, filtry), podaj dokładny typ i parametry dla tego konkretnego modelu. Jeśli pyta o kod błędu, podaj jego dokładne znaczenie i kroki naprawy. Używaj wyszukiwarki Google, aby znaleźć twarde dane techniczne na temat zadanego modelu. Bądź zwięzły i profesjonalny." }] },
      tools: [{ google_search: {} }] 
    };

    let delay = 1000;
    for (let i = 0; i < retries; i++) {
      try {
        // TUTA JEST KLUCZ! Wysyłamy zapytanie prosto do naszego bezpiecznego serwera na Vercel
        const response = await fetch(`/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Błąd serwera: ${response.status} - ${errorData.error?.message || errorData.error || 'Odrzucono'}`);
        }
        
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Przepraszam, nie udało mi się wygenerować odpowiedzi.";
      } catch (error) {
        if (i === retries - 1) {
          return `🚨 **Błąd komunikacji z serwerem:**\n${error.message}`;
        }
        await new Promise(res => setTimeout(res, delay));
        delay *= 2;
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    const newHistory = [...history, userMessage];
    updateHistory(newHistory);
    setInput('');
    setIsTyping(true);

    const aiResponseText = await callGeminiAPI(userMessage.text);

    const aiMessage = {
      role: 'ai',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    updateHistory([...newHistory, aiMessage]);
    setIsTyping(false);
  };

  const formatText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\n)/g);
    return parts.map((part, i) => {
      if (part === '\n') return <br key={i} />;
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Zmienione szybkie pytania, aby uniknąć błędów tłumacza!
  const quickPrompts = [
    "Szukaj instrukcji PDF",
    "Znaczenie kodów błędów",
    "Funkcje ukryte",
    "Jak dbać o sprzęt?"
  ];

  return (
    <>
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center gap-3 shrink-0 relative">
        <div className="bg-blue-100 p-2 rounded-lg shrink-0">
          <Bot className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">
            {device.brand} {device.model}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-500">{device.type}</p>
        </div>
        
        <button 
          onClick={() => setShowClearConfirm(true)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Wyczyść historię czatu"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        {showClearConfirm && (
          <div className="absolute top-full right-2 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-50 w-64 sm:w-72">
            <p className="text-sm font-semibold text-slate-800 mb-3">Usunąć historię tego czatu?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowClearConfirm(false)} className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">Anuluj</button>
              <button onClick={handleClearHistory} className="px-3 py-2 text-xs bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium">Wyczyść</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
            {msg.role === 'ai' && (
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mr-2 mt-1">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
            
            <div className={`p-2.5 sm:p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
            }`}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {msg.role === 'ai' ? formatText(msg.text) : msg.text}
              </div>
              <div className={`text-[9px] sm:text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex max-w-[80%] mr-auto">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mr-2 mt-1">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 rounded-tl-none shadow-sm flex items-center gap-2 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> ...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 sm:p-4 bg-white border-t border-slate-200 flex flex-col shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-1 scrollbar-hide w-full" translate="no">
          {quickPrompts.map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInput(promptText)}
              className="whitespace-nowrap flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-[11px] sm:text-xs rounded-full border border-slate-200 transition-colors"
            >
              <Zap className="w-3 h-3 text-amber-500" /> {promptText}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2 w-full items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Napisz..."
            className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-2.5 sm:py-3 outline-none transition-all text-sm min-w-0"
            disabled={isTyping}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2.5 sm:p-3 rounded-xl transition-colors flex items-center justify-center shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
}