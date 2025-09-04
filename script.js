const productInput = document.getElementById('productInput');
const addProductBtn = document.getElementById('addProductBtn');
const productList = document.getElementById('productList');
const suggestionsList = document.getElementById('suggestions');
const clearListBtn = document.getElementById('clearListBtn');
const completionMessage = document.getElementById('completionMessage');

// --- Funções de Persistência e Lógica ---

// Salva a lista no localStorage
function saveList() {
    const items = [];
    document.querySelectorAll('.product-item').forEach(item => {
        items.push({
            name: item.querySelector('span').textContent,
            quantity: item.querySelector('.quantity').textContent,
            image: item.querySelector('img').src,
            completed: item.classList.contains('completed')
        });
    });
    localStorage.setItem('shoppingList', JSON.stringify(items));
}

// Carrega a lista do localStorage
function loadList() {
    const items = JSON.parse(localStorage.getItem('shoppingList')) || [];
    items.forEach(item => {
        const li = document.createElement('li');
        li.className = `product-item ${item.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="item-content">
                <img src="${item.image}" alt="Imagem do Produto">
                <span>${item.name}</span>
            </div>
            <div class="quantity-controls">
                <button class="decrease-qty-btn">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="increase-qty-btn">+</button>
            </div>
            <div class="item-actions">
                <button class="check-btn"><i class="fas fa-check"></i></button>
                <button class="remove-btn"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        productList.appendChild(li);
    });
    checkCompletion();
}

// Verifica se todos os itens foram marcados e exibe a mensagem
function checkCompletion() {
    const totalItems = document.querySelectorAll('.product-item').length;
    const completedItems = document.querySelectorAll('.product-item.completed').length;
    
    if (totalItems > 0 && totalItems === completedItems) {
        completionMessage.textContent = 'Todos os itens foram buscados!';
        completionMessage.style.display = 'block';
    } else {
        completionMessage.style.display = 'none';
    }
}

// --- Funções Auxiliares (já existentes) ---

// Função para remover acentos...
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Função para mostrar sugestões...
function showSuggestions() {
    const query = removeAccents(productInput.value.toLowerCase());
    suggestionsList.innerHTML = '';

    if (query.length < 2) {
        return;
    }

    const filteredProducts = productsDB.filter(product =>
        removeAccents(product.name.toLowerCase()).includes(query)
    );

    filteredProducts.forEach(product => {
        const li = document.createElement('li');
        li.textContent = product.name;
        li.addEventListener('click', () => {
            productInput.value = product.name;
            addProduct();
        });
        suggestionsList.appendChild(li);
    });
}

// --- Lógica Principal da Lista de Compras ---

// Adicionar produto
function addProduct() {
    const productNameInput = productInput.value.trim();
    if (productNameInput === '') {
        alert('Por favor, insira o nome de um produto.');
        return;
    }

    const productData = productsDB.find(item =>
        removeAccents(item.name.toLowerCase()) === removeAccents(productNameInput.toLowerCase())
    );

    const imageUrl = productData ? productData.image : "https://via.placeholder.com/40";
    const displayName = productData ? productData.name : productNameInput;

    // Verificação de duplicidade

    const existingItems = document.querySelectorAll('#productList .item-content span');
    let isDuplicate = false;
    existingItems.forEach(item => {
        if (removeAccents(item.textContent.toLowerCase()) === removeAccents(displayName.toLowerCase())) {
            isDuplicate = true;
        }
    });

    if (isDuplicate) {
        const confirmAdd = confirm(`O produto "${displayName}" já foi adicionado. Deseja adicioná-lo novamente?`);
        if (!confirmAdd) {
            productInput.value = '';
            suggestionsList.innerHTML = '';
            return;
        }
    }


    const li = document.createElement('li');
    li.className = 'product-item';
    li.innerHTML = `
        <div class="item-content">
            <img src="${imageUrl}" alt="Imagem do Produto">
            <span>${displayName}</span>
        </div>
        <div class="quantity-controls">
            <button class="decrease-qty-btn">-</button>
            <span class="quantity">1</span>
            <button class="increase-qty-btn">+</button>
        </div>
        <div class="item-actions">
                <button class="check-btn"><i class="fas fa-check"></i></button>
                <button class="remove-btn"><i class="fas fa-trash-alt"></i></button>
        </div>
    `;

    productList.appendChild(li);
    productInput.value = '';
    suggestionsList.innerHTML = '';
    saveList(); // Salva a lista após adicionar um item
    checkCompletion(); // Verifica a conclusão
}

// --- Event Listeners ---

// Adicionar produto ao clicar no botão
addProductBtn.addEventListener('click', addProduct);

// Adicionar produto ao pressionar 'Enter'
productInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addProduct();
    }
});

// Evento para mostrar sugestões em tempo real
productInput.addEventListener('input', showSuggestions);

// Manipular cliques na lista de produtos para check, remover e quantidade
productList.addEventListener('click', (e) => {
    const target = e.target;
    const item = target.closest('.product-item');

    if (!item) return;

    if (target.closest('.check-btn')) {
        item.classList.toggle('completed');
        saveList();
        checkCompletion();
    }

    if (target.closest('.remove-btn')) {
        productList.removeChild(item);
        saveList();
        checkCompletion();
    }

    if (target.closest('.increase-qty-btn')) {
        const quantitySpan = item.querySelector('.quantity');
        let quantity = parseInt(quantitySpan.textContent);
        quantitySpan.textContent = quantity + 1;
        saveList();
    }

    if (target.closest('.decrease-qty-btn')) {
        const quantitySpan = item.querySelector('.quantity');
        let quantity = parseInt(quantitySpan.textContent);
        if (quantity > 1) {
            quantitySpan.textContent = quantity - 1;
            saveList();
        }
    }
});

// Zera a lista ao clicar no botão
clearListBtn.addEventListener('click', () => {
    localStorage.removeItem('shoppingList');
    productList.innerHTML = '';
    checkCompletion();
});

// Esconder a lista de sugestões se o usuário clicar fora dela
document.addEventListener('click', (e) => {
    if (!e.target.closest('.input-area')) {
        suggestionsList.innerHTML = '';
    }
});

// --- Início da Aplicação ---

// Carrega a lista quando a página é carregada
document.addEventListener('DOMContentLoaded', loadList);