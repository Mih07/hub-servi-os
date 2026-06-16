import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importe para criar os links
import { supabase } from '../supabaseClient';

function Home() {
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Tudo');
  const [regiaoSelecionada, setRegiaoSelecionada] = useState('Itupeva, SP');
  
  const lojasLocais = [ /* ... MANTENHA SEU ARRAY DE LOJAS AQUI ... */ ];

  const [lojas, setLojas] = useState(lojasLocais);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarLojasDoBanco() {
      try {
        setCarregando(true);
        const { data, error } = await supabase.from('servicos').select('*').eq('aprovado', true);
        if (error) throw error;
        setLojas(data ? [...lojasLocais, ...data] : lojasLocais);
      } catch (error) {
        console.error('Erro:', error.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarLojasDoBanco();
  }, []); // Dependência vazia, roda apenas uma vez ao carregar a página

  const lojasFiltradas = lojas.filter((loja) => {
    const termoBusca = busca.toLowerCase();
    const nomeLoja = loja.nome?.toLowerCase() || '';
    const categoriaLoja = loja.categoria?.toLowerCase() || '';
    const regiaoLoja = loja.regiao || 'Itupeva, SP';
    return (nomeLoja.includes(termoBusca) || categoriaLoja.includes(termoBusca)) &&
           (categoriaSelecionada === 'Tudo' || loja.categoria === categoriaSelecionada) &&
           (regiaoLoja === regiaoSelecionada);
  });

  return (
    <>
      {/* AQUI VOCÊ COLA TODO O SEU HEADER E O GRID QUE ESTAVA DENTRO DE (telaAtual === '') */}
      
      {/* Exemplo de como trocar o botão de navegação: */}
      <Link to="/cadastro" className="btn btn-primary">
        Quero Anunciar Grátis ou Premium
      </Link>

      {/* No botão de Cardápio: */}
      <Link to={`/cardapio/${loja.id}`} className="btn btn-primary">
        Ver Catálogo ➔
      </Link>
    </>
  );
}

export default Home;