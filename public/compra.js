const btnComprar = document.getElementById('btn-comprar-acao');
        const btnVoltar = document.getElementById('btn-voltar-detalhes');
        const abaDetalhes = document.getElementById('aba-detalhes');
        const abaCompra = document.getElementById('aba-compra');

        btnComprar.addEventListener('click', () => {
            abaDetalhes.style.display = 'none';
            abaCompra.style.display = 'block';
        });

        
        btnVoltar.addEventListener('click', () => {
            abaCompra.style.display = 'none';
            abaDetalhes.style.display = 'block';
        });

        const abaComp = document.getElementById('aba-compra');
const abaSucesso = document.getElementById('aba-sucesso');
const btnConfirmar = document.getElementById('btn-confirmar');

if(btnConfirmar) {
    btnConfirmar.addEventListener('click', function() {
        const produtoId = this.getAttribute('data-produto-id');
        const quantidade = document.getElementById('quantidade').value;
        const formaPagamento = document.getElementById('forma-pagamento').value;

        btnConfirmar.disabled = true;
        btnConfirmar.innerText = "Processando...";

        fetch('/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                produtoId,
                quantidade,
                formaPagamento
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                abaComp.style.display = 'none';
                abaSucesso.style.display = 'flex';
            } else {
                alert(data.error || "Erro ao realizar a compra.");
                btnConfirmar.disabled = false;
                btnConfirmar.innerText = "Confirmar Pagamento";
            }
        })
        .catch(err => {
            console.error("Erro na compra:", err);
            alert("Erro de conexão ao processar compra.");
            btnConfirmar.disabled = false;
            btnConfirmar.innerText = "Confirmar Pagamento";
        });
    });
}