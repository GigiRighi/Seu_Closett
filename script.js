/**
 * SEU CLOSET - JavaScript Principal
 * Controle de navegação, segurança de rotas, login persistente,
 * simulador, closet e galeria de looks salvos via LocalStorage.
 */

// 1. Estados Globais (Iniciam carregando dados da memória do navegador)
let usuarioLogado = localStorage.getItem('usuarioLogado') === 'true';
let fotoTemporariaBase64 = null; 

// Banco de imagens inicial do simulador (será complementado com os uploads do usuário)
let items = {
    top: [
        'https://www.pngall.com/wp-content/uploads/2016/04/T-Shirt-PNG-HD.png',
        'https://www.pngall.com/wp-content/uploads/2016/04/T-Shirt-Free-Download-PNG.png',
        'https://www.pngall.com/wp-content/uploads/2016/04/T-Shirt-PNG-Image.png'
    ],
    bottom: [
        'https://www.pngall.com/wp-content/uploads/2016/03/Skirt-PNG-File.png',
        'https://www.pngall.com/wp-content/uploads/2016/03/Skirt-PNG-Image.png',
        'https://www.pngall.com/wp-content/uploads/2016/03/Skirt-Free-PNG-Image.png'
    ]
};

let currentIndex = { top: 0, bottom: 0 };

// 2. Monitoramento de carga inicial da janela
document.addEventListener('DOMContentLoaded', () => {
    bindCameraEvent();
    carregarRoupasSalvas();
    carregarLooksSalvos();
});

// Força a atualização da interface caso o usuário já esteja autenticado
function verificarLoginExistente() {
    console.log("Verificando sessão ativa... Estado:", usuarioLogado);
    if (usuarioLogado) {
        const nomeSalvo = localStorage.getItem('nomeUsuario') || "Usuária(o)";
        
        const loginItem = document.getElementById('menu-login-item');
        const userInfo = document.getElementById('user-info');
        const userNameSpan = document.getElementById('user-name');

        if (loginItem && userInfo && userNameSpan) {
            userNameSpan.textContent = nomeSalvo;
            loginItem.style.display = 'none';       
            userInfo.style.display = 'flex';        
        }

        // Altera o ícone de cadeado do menu mobile se estiver logado
        const mobileLinks = document.querySelectorAll('.mobile-nav a');
        mobileLinks.forEach(link => {
            if (link.getAttribute('onclick') === "showSection('login-section')") {
                link.innerHTML = "<span>👤</span>Conta";
            }
        });
    }
}

// Sistema de Navegação Geral com Validação de Login
function showSection(sectionId) {
    const secoesProtegidas = ['closet', 'montagem'];

    if (secoesProtegidas.includes(sectionId) && !usuarioLogado) {
        alert("🔒 Acesso restrito! Por favor, faça login ou cadastre-se para liberar o seu closet. ✨");
        sectionId = 'login-section';
    }

    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    window.scrollTo(0, 0);
}

// 3. Sistema de Login e Cadastro (Abas e Submissão)
function toggleAuthMode(mode) {
    const formLogin = document.getElementById('form-login');
    const formCadastro = document.getElementById('form-cadastro');
    const tabLogin = document.getElementById('tab-login');
    const tabCadastro = document.getElementById('tab-cadastro');

    if (mode === 'login') {
        formLogin.style.display = 'block';
        formCadastro.style.display = 'none';
        tabLogin.classList.add('active-tab');
        tabCadastro.classList.remove('active-tab');
    } else {
        formLogin.style.display = 'none';
        formCadastro.style.display = 'block';
        tabLogin.classList.remove('active-tab');
        tabCadastro.classList.add('active-tab');
    }
}

function handleAuth(event, mode) {
    event.preventDefault();
    let nomeUsuario = "";

    if (mode === 'login') {
        const email = document.getElementById('login-email').value;
        nomeUsuario = email.split('@')[0]; 
        alert(`Bem-vinda de volta! Seu closet foi 100% liberado. ✨`);
    } else {
        nomeUsuario = document.getElementById('cad-nome').value;
        alert(`Conta criada com sucesso, ${nomeUsuario}! Divirta-se criando looks. 💖`);
    }

    usuarioLogado = true;
    localStorage.setItem('usuarioLogado', 'true');
    localStorage.setItem('nomeUsuario', nomeUsuario);

    verificarLoginExistente();
    showSection('home');
}

function handleLogout() {
    usuarioLogado = false;
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('nomeUsuario');
    
    const loginItem = document.getElementById('menu-login-item');
    const userInfo = document.getElementById('user-info');
    
    if (loginItem && userInfo) {
        loginItem.style.display = 'block'; 
        userInfo.style.display = 'none';   
    }

    const mobileLinks = document.querySelectorAll('.mobile-nav a');
    mobileLinks.forEach(link => {
        if (link.getAttribute('onclick') === "showSection('login-section')") {
            link.innerHTML = "<span>🔒</span>Login";
        }
    });
    
    alert("Você saiu da sua conta. As seções privadas foram bloqueadas novamente!");
    showSection('home');
}

// 4. Simulador de Combinação de Looks (Carrossel)
function changeItem(type, direction) {
    currentIndex[type] += direction;
    
    if (currentIndex[type] < 0) {
        currentIndex[type] = items[type].length - 1;
    } else if (currentIndex[type] >= items[type].length) {
        currentIndex[type] = 0;
    }
    
    const imgElement = document.getElementById(type + '-img');
    if (imgElement) {
        imgElement.style.opacity = 0;
        setTimeout(() => {
            imgElement.src = items[type][currentIndex[type]];
            imgElement.style.opacity = 1;
        }, 200);
    }
}

// Salva o Look na galeria lateral e na memória permanente
function saveCurrentOutfit() {
    const topImgSrc = document.getElementById('top-img').src;
    const bottomImgSrc = document.getElementById('bottom-img').src;

    const novoLook = {
        top: topImgSrc,
        bottom: bottomImgSrc,
        nome_look: "Look Combinado",
        ocasiao: "Casual/Y2K"
    };

    // Pega a lista existente na memória ou cria uma nova se estiver vazia
    let looksSalvos = JSON.parse(localStorage.getItem('looksSalvos')) || [];
    looksSalvos.unshift(novoLook); // Adiciona no início da lista
    localStorage.setItem('looksSalvos', JSON.stringify(looksSalvos));

    // Atualiza a exibição visual da galeria lateral
    renderizarLookNaGaleria(novoLook, true);

    alert("Look salvo de forma permanente na galeria lateral! 💖🕶️");
}

// Função auxiliar para desenhar o card do look na tela
function renderizarLookNaGaleria(lookObj, inserirNoInicio = false) {
    const grid = document.getElementById('saved-outfits-grid');
    const noOutfitsMsg = document.getElementById('no-outfits-msg');
    if (!grid) return;

    if (noOutfitsMsg) noOutfitsMsg.style.display = 'none';

    const outfitCard = document.createElement('div');
    outfitCard.className = 'outfit-card';
    outfitCard.style.cssText = "background: #f9f9f9; border: 2px solid #ff007f; padding: 10px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 5px; position: relative;";

    const topThumb = document.createElement('img');
    topThumb.src = lookObj.top;
    topThumb.style.cssText = "height: 60px; object-fit: contain;";

    const bottomThumb = document.createElement('img');
    bottomThumb.src = lookObj.bottom;
    bottomThumb.style.cssText = "height: 60px; object-fit: contain;";

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = "❌";
    deleteBtn.style.cssText = "position: absolute; top: 2px; right: 2px; background: transparent; border: none; cursor: pointer; font-size: 0.7rem;";
    
    deleteBtn.onclick = function() {
        outfitCard.remove();
        
        // Remove também do LocalStorage
        let looksSalvos = JSON.parse(localStorage.getItem('looksSalvos')) || [];
        looksSalvos = looksSalvos.filter(l => l.top !== lookObj.top || l.bottom !== lookObj.bottom);
        localStorage.setItem('looksSalvos', JSON.stringify(looksSalvos));

        if (grid.children.length === 0 || (grid.children.length === 1 && grid.children[0].id === 'no-outfits-msg')) {
            if (noOutfitsMsg) noOutfitsMsg.style.display = 'block';
        }
    };

    outfitCard.appendChild(deleteBtn);
    outfitCard.appendChild(topThumb);
    outfitCard.appendChild(bottomThumb);

    if (inserirNoInicio) {
        grid.insertBefore(outfitCard, grid.firstChild);
    } else {
        grid.appendChild(outfitCard);
    }
}

// Busca os looks na memória do navegador ao dar F5
function carregarLooksSalvos() {
    const looksSalvos = JSON.parse(localStorage.getItem('looksSalvos')) || [];
    looksSalvos.forEach(look => {
        renderizarLookNaGaleria(look, false);
    });
}


// 5. Captura de Câmera e Gerenciamento do Closet
function bindCameraEvent() {
    const cameraInput = document.getElementById('camera-input');
    const shelfContainer = document.querySelector('.shelf');
    const uploadControls = document.getElementById('upload-controls');
    const uploadTip = document.getElementById('upload-tip');

    if (cameraInput && shelfContainer) {
        cameraInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    fotoTemporariaBase64 = e.target.result;
                    shelfContainer.innerHTML = ''; 
                    const newImage = document.createElement('img');
                    newImage.src = fotoTemporariaBase64;
                    newImage.style.maxWidth = '100%'; newImage.style.maxHeight = '100%'; newImage.style.borderRadius = '12px'; newImage.style.objectFit = 'cover';
                    shelfContainer.appendChild(newImage);

                    if(uploadControls) uploadControls.style.display = 'block';
                    if(uploadTip) uploadTip.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Salva a peça permanentemente na lista de roupas do simulador
function saveUploadedPiece() {
    const categoriaTexto = document.getElementById('piece-type').value; // 'top' ou 'bottom'
    const nomeInput = document.getElementById('nome-roupa').value || "Nova Peça";
    
    if (!fotoTemporariaBase64) {
        alert("Por favor, tire uma foto primeiro!");
        return;
    }

    // Adiciona na memória do simulador atual
    items[categoriaTexto].unshift(fotoTemporariaBase64);
    currentIndex[categoriaTexto] = 0;

    // Salva na memória do navegador (LocalStorage) para resistir ao F5
    let roupasSalvas = JSON.parse(localStorage.getItem('roupasSalvas')) || { top: [], bottom: [] };
    roupasSalvas[categoriaTexto].unshift(fotoTemporariaBase64);
    localStorage.setItem('roupasSalvas', JSON.stringify(roupasSalvas));

    const imgElement = document.getElementById(categoriaTexto + '-img');
    if (imgElement) {
        imgElement.src = fotoTemporariaBase64;
    }

    alert(`A peça "${nomeInput}" foi adicionada permanentemente ao seu carrossel! ✨`);
    resetClosetScreen();
    showSection('montagem');
}

// Recupera as fotos das roupas tiradas anteriormente ao dar F5
function carregarRoupasSalvas() {
    const roupasSalvas = JSON.parse(localStorage.getItem('roupasSalvas')) || { top: [], bottom: [] };
    
    // Injeta as fotos salvas dentro das respectivas categorias do simulador
    roupasSalvas.top.forEach(foto => items.top.unshift(foto));
    roupasSalvas.bottom.forEach(foto => items.bottom.unshift(foto));
}

function resetClosetScreen() {
    const shelfContainer = document.querySelector('.shelf');
    const uploadControls = document.getElementById('upload-controls');
    const uploadTip = document.getElementById('upload-tip');
    fotoTemporariaBase64 = null;
    
    if (shelfContainer) {
        shelfContainer.innerHTML = `
            <label class="add-item" style="cursor: pointer;">
                ➕
                <input type="file" accept="image/*" capture="environment" id="camera-input" style="display: none;">
            </label>
        `;
        bindCameraEvent(); 
    }
    if(uploadControls) uploadControls.style.display = 'none';
    if(uploadTip) uploadTip.style.display = 'block';
} 