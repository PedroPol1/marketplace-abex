const btnComprar = document.querySelector('.button');
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
        
         abaComp.style.display = 'none';
        
        
        abaSucesso.style.display = 'flex'; 
    });
}