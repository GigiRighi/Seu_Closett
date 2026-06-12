/**
 * SEU CLOSET - JavaScript Principal
 * Controle de navegação, segurança de rotas, login persistente,
 * simulador, closet e galeria de looks salvos isolados por usuário.
 */

// 1. Estados Globais (Iniciam carregando dados da memória do navegador)
let usuarioLogado = localStorage.getItem('usuarioLogado') === 'true';
let fotoTemporariaBase64 = null; 

// Banco de imagens inicial do simulador (padrão global)
let itemsPadrao = {
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

// Clona o banco padrão para os itens ativos no carrossel
let items = JSON.parse(JSON.stringify(itemsPadrao));
let currentIndex = { top: 0, bottom: 0 };

// 2. Monitoramento de carga inicial da janela
document.addEventListener('DOMContentLoaded', () => {
    bindCameraEvent();
    verificarLoginExistente(); // Garante a atualização dos menus e dados se já estiver logado
});

// Força a atualização da interface caso o usuário já esteja autenticado
function verificarLoginExistente() {
    console.log("Verificando sessão activa... Estado:", usuarioLogado);
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

        // CARREGA APENAS os dados específicos deste usuário que logou
        carregarRoupasSalvas();
        carregarLooksSalvos();
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
    let idUsuarioFicticio = Math.floor(Math.random() * 1000) + 1; // Cria um ID numérico para simular o banco de dados

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
    // Armazena um ID para usar nas requisições do seu backend Neon
    localStorage.setItem('idUsuarioLogado', idUsuarioFicticio);

    // Reseta o carrossel para o padrão antes de injetar as roupas do usuário novo
    items = JSON.parse(JSON.stringify(itemsPadrao));
    currentIndex = { top: 0, bottom: 0 };

    // Limpa a galeria lateral antiga da tela antes de renderizar a nova
    const grid = document.getElementById('saved-outfits-grid');
    if (grid) grid.innerHTML = '<p id="no-outfits-msg" class="empty-msg">Nenhum look salvo ainda. Comece a criar!</p>';

    verificarLoginExistente();
    showSection('home');
}

function handleLogout() {
    usuarioLogado = false;
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('nomeUsuario');
    localStorage.removeItem('idUsuarioLogado'); // Limpa o ID de controle
    
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

    // Limpa a galeria visual da tela
    const grid = document.getElementById('saved-outfits-grid');
    if (grid) grid.innerHTML = '<p id="no-outfits-msg" class="empty-msg">Nenhum look salvo ainda. Comece a criar!</p>';

    // Reseta o carrossel de imagens de volta para o padrão original deslogado
    items = JSON.parse(JSON.stringify(itemsPadrao));
    currentIndex = { top: 0, bottom: 0 };
    
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

// Salva o Look na galeria lateral e INTEGRADO com seu Backend Neon
async function saveCurrentOutfit() {
    const topImgSrc = document.getElementById('top-img').src;
    const bottomImgSrc = document.getElementById('bottom-img').src;
    const nomeUsuario = localStorage.getItem('nomeUsuario');
    const idUsuario = localStorage.getItem('idUsuarioLogado') || 1;

    const nomeLook = "Look Combinado";
    const ocasiaoLook = "Casual/Y2K";

    const novoLook = {
        top: topImgSrc,
        bottom: bottomImgSrc,
        nome_look: nomeLook,
        ocasiao: ocasiaoLook
    };

    // 1. ISOLAMENTO EM LOCALSTORAGE: Salva numa chave exclusiva deste usuário
    const chaveLooks = `looksSalvos_${nomeUsuario}`;
    let looksSalvos = JSON.parse(localStorage.getItem(chaveLooks)) || [];
    looksSalvos.unshift(novoLook);
    localStorage.setItem(chaveLooks, JSON.stringify(looksSalvos));

    // Atualiza a exibição visual da galeria lateral imediatamente
    renderizarLookNaGaleria(novoLook, true);

    // 2. INTEGRAÇÃO COM BACKEND NEON: Envia para o seu server.js
    try {
        const response = await fetch('http://localhost:3000/api/looks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: parseInt(idUsuario), // ID dinâmico do usuário atual
                nome_look: nomeLook,
                ocasiao: ocasiaoLook
            })
        });

        const dados = await response.json();
        if (dados.success) {
            console.log("Look sincronizado e salvo com sucesso no banco Neon!", dados.look);
        }
    } catch (erro) {
        console.error("Erro ao enviar dados para o servidor Neon:", erro);
        // Não bloqueia o fluxo do usuário caso o servidor local esteja desligado
    }

    alert("Look salvo de forma permanente na sua galeria! 💖🕶️");
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
        
        // Remove do LocalStorage filtrando pela chave isolada do usuário atual
        const nomeUsuario = localStorage.getItem('nomeUsuario');
        const chaveLooks = `looksSalvos_${nomeUsuario}`;
        
        let looksSalvos = JSON.parse(localStorage.getItem(chaveLooks)) || [];
        looksSalvos = looksSalvos.filter(l => l.top !== lookObj.top || l.bottom !== lookObj.bottom);
        localStorage.setItem(chaveLooks, JSON.stringify(looksSalvos));

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

// Busca os looks na memória isolada do usuário logado ao dar F5
function carregarLooksSalvos() {
    const nomeUsuario = localStorage.getItem('nomeUsuario');
    if (!nomeUsuario) return;

    const chaveLooks = `looksSalvos_${nomeUsuario}`;
    const looksSalvos = JSON.parse(localStorage.getItem(chaveLooks)) || [];
    
    // Limpa mensagens residuais antes de carregar
    const noOutfitsMsg = document.getElementById('no-outfits-msg');
    if (looksSalvos.length > 0 && noOutfitsMsg) {
        noOutfitsMsg.style.display = 'none';
    }

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

// Salva a peça na lista de roupas ISOLADA por usuário e envia ao servidor
async function saveUploadedPiece() {
    const categoriaTexto = document.getElementById('piece-type').value; // 'top' ou 'bottom'
    const nomeInput = document.getElementById('nome-roupa').value || "Nova Peça";
    const nomeUsuario = localStorage.getItem('nomeUsuario');
    const idUsuario = localStorage.getItem('idUsuarioLogado') || 1;
    
    if (!fotoTemporariaBase64) {
        alert("Por favor, tire uma foto primeiro!");
        return;
    }

    // Adiciona na memória ativa do simulador local
    items[categoriaTexto].unshift(fotoTemporariaBase64);
    currentIndex[categoriaTexto] = 0;

    // 1. ISOLAMENTO EM LOCALSTORAGE: Salva na chave exclusiva daquele usuário
    const chaveRoupas = `roupasSalvas_${nomeUsuario}`;
    let roupasSalvas = JSON.parse(localStorage.getItem(chaveRoupas)) || { top: [], bottom: [] };
    roupasSalvas[categoriaTexto].unshift(fotoTemporariaBase64);
    localStorage.setItem(chaveRoupas, JSON.stringify(roupasSalvas));

    // 2. INTEGRAÇÃO COM BACKEND NEON: Envia para a rota de roupas
    try {
        await fetch('http://localhost:3000/api/roupas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome_roupa: nomeInput,
                id_categoria: categoriaTexto === 'top' ? 1 : 2, // 1 para Superior, 2 para Inferior
                id_usuario: parseInt(idUsuario),
                imagem_roupa: fotoTemporariaBase64 // Base64 da imagem
            })
        });
    } catch (erro) {
        console.error("Erro ao sincronizar roupa com o banco Neon:", erro);
    }

    const imgElement = document.getElementById(categoriaTexto + '-img');
    if (imgElement) {
        imgElement.src = fotoTemporariaBase64;
    }

    alert(`A peça "${nomeInput}" foi adicionada permanentemente ao seu perfil! ✨`);
    resetClosetScreen();
    showSection('montagem');
}

// Recupera as fotos das roupas específicas do usuário logado ao dar F5
function carregarRoupasSalvas() {
    const nomeUsuario = localStorage.getItem('nomeUsuario');
    if (!nomeUsuario) return;

    const chaveRoupas = `roupasSalvas_${nomeUsuario}`;
    const roupasSalvas = JSON.parse(localStorage.getItem(chaveRoupas)) || { top: [], bottom: [] };
    
    // Injeta as fotos salvas do usuário específico dentro do carrossel ativo
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