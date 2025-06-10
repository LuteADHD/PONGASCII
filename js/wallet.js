// wallet.js - Phantom Wallet Integration for ASCIIPong

// Zmienne globalne - tu trzymamy informacje o portfelu
let walletConnected = false;        // Czy portfel jest połączony
let walletAddress = '';             // Adres portfela użytkownika  
let walletBalance = 0;              // Ile SOL ma użytkownik
let phantom = null;                 // Obiekt Phantom Wallet

// Funkcja która sprawdza czy użytkownik ma zainstalowany Phantom
function checkPhantomInstalled() {
    // Phantom dodaje obiekt 'solana' do window przeglądarki
    if (window.solana && window.solana.isPhantom) {
        console.log('✅ Phantom Wallet znaleziony!');
        phantom = window.solana;
        return true;
    } else {
        console.log('❌ Phantom Wallet nie jest zainstalowany');
        return false;
    }
}

// Główna funkcja łączenia z portfelem
async function connectWallet() {
    // Sprawdź czy Phantom jest zainstalowany
    if (!checkPhantomInstalled()) {
        alert('Phantom Wallet nie jest zainstalowany!\n\nPobierz go z: https://phantom.app');
        window.open('https://phantom.app', '_blank');
        return false;
    }

    try {
        console.log('🔄 Próba połączenia z Phantom...');
        
        // Poproś użytkownika o połączenie
        // To otworzy popup Phantom gdzie użytkownik musi kliknąć "Connect"
        const response = await phantom.connect();
        
        // Jeśli się udało - zapisz dane
        walletAddress = response.publicKey.toString();
        walletConnected = true;
        
        console.log('✅ Portfel połączony!');
        console.log('📧 Adres:', walletAddress);
        
        // Pobierz balans SOL
        await updateWalletBalance();
        
        // Zaktualizuj interfejs strony
        updateWalletUI();
        
        return true;
        
    } catch (error) {
        console.error('❌ Błąd połączenia:', error);
        alert('Nie udało się połączyć z portfelem. Spróbuj ponownie.');
        return false;
    }
}

// Funkcja rozłączania portfela
async function disconnectWallet() {
    try {
        // Rozłącz Phantom
        await phantom.disconnect();
        
        // Wyczyść dane
        walletConnected = false;
        walletAddress = '';
        walletBalance = 0;
        
        console.log('👋 Portfel rozłączony');
        
        // Zaktualizuj interfejs
        updateWalletUI();
        
    } catch (error) {
        console.error('❌ Błąd rozłączania:', error);
    }
}

// Funkcja sprawdzania ile SOL ma użytkownik
async function updateWalletBalance() {
    if (!walletConnected) return;
    
    try {
        console.log('💰 Sprawdzam balans...');
        
        // Tutaj będzie prawdziwe sprawdzanie balansu Solana
        // Na razie symulujemy losowy balans dla testu
        walletBalance = (Math.random() * 10 + 1).toFixed(2);
        
        console.log('💰 Balans:', walletBalance, 'SOL');
        
        // W prawdziwej wersji użyjemy Solana Web3.js:
        // const connection = new Connection('https://api.mainnet-beta.solana.com');
        // const balance = await connection.getBalance(new PublicKey(walletAddress));
        // walletBalance = balance / 1000000000; // Konwersja z lamportów na SOL
        
    } catch (error) {
        console.error('❌ Błąd sprawdzania balansu:', error);
        walletBalance = 0;
    }
}

// Funkcja aktualizacji interfejsu użytkownika
function updateWalletUI() {
    // Znajdź elementy na stronie
    const connectBtn = document.getElementById('connectWallet');
    const walletInfo = document.getElementById('walletInfo');
    const walletAddressSpan = document.getElementById('walletAddress');
    const walletBalanceSpan = document.getElementById('walletBalance');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    
    if (walletConnected) {
        // Portfel połączony - pokaż informacje
        connectBtn.textContent = 'Disconnect Wallet';
        connectBtn.onclick = disconnectWallet;
        
        walletInfo.style.display = 'block';
        walletAddressSpan.textContent = shortenAddress(walletAddress);
        walletBalanceSpan.textContent = walletBalance;
        
        // Włącz tworzenie pokojów
        createRoomBtn.disabled = false;
        createRoomBtn.textContent = 'Create Room';
        
        // Włącz chat
        chatInput.disabled = false;
        chatSend.disabled = false;
        
        // Dodaj wiadomość do chatu
        addChatMessage('System', 'Wallet connected successfully!', '#00ff00');
        
    } else {
        // Portfel rozłączony - ukryj informacje  
        connectBtn.textContent = 'Connect Phantom Wallet';
        connectBtn.onclick = connectWallet;
        
        walletInfo.style.display = 'none';
        
        // Wyłącz tworzenie pokojów
        createRoomBtn.disabled = true;
        createRoomBtn.textContent = 'Create Room (Wallet Required)';
        
        // Wyłącz chat
        chatInput.disabled = true;
        chatSend.disabled = true;
        
        // Dodaj wiadomość do chatu
        addChatMessage('System', 'Wallet disconnected.', '#ff6666');
    }
}

// Funkcja skracania długiego adresu portfela
// Zamienia "A1B2C3D4E5F6G7H8..." na "A1B2C3...G7H8"
function shortenAddress(address) {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Funkcja sprawdzania czy użytkownik ma wystarczająco SOL
function checkSufficientBalance(requiredAmount) {
    if (!walletConnected) {
        alert('Najpierw połącz portfel!');
        return false;
    }
    
    if (walletBalance < requiredAmount) {
        alert(`Nie masz wystarczająco SOL!\nPotrzebujesz: ${requiredAmount} SOL\nMasz: ${walletBalance} SOL`);
        return false;
    }
    
    return true;
}

// Funkcja inicjalizacji - uruchamia się gdy strona się ładuje
function initWallet() {
    console.log('🚀 Inicjalizacja systemu portfela...');
    
    // Sprawdź czy Phantom jest zainstalowany
    checkPhantomInstalled();
    
    // Nasłuchuj na zmiany połączenia
    if (phantom) {
        phantom.on('connect', (publicKey) => {
            console.log('🔗 Phantom połączony automatycznie:', publicKey.toString());
            walletAddress = publicKey.toString();
            walletConnected = true;
            updateWalletBalance();
            updateWalletUI();
        });
        
        phantom.on('disconnect', () => {
            console.log('🔌 Phantom rozłączony automatycznie');
            walletConnected = false;
            walletAddress = '';
            walletBalance = 0;
            updateWalletUI();
        });
    }
    
    console.log('✅ System portfela gotowy!');
}

// Eksportuj funkcje żeby inne pliki mogły ich używać
window.walletFunctions = {
    connectWallet,
    disconnectWallet,
    updateWalletBalance,
    checkSufficientBalance,
    initWallet,
    // Gettery do sprawdzania stanu
    get isConnected() { return walletConnected; },
    get address() { return walletAddress; },
    get balance() { return walletBalance; }
};