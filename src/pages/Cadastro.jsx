import { useState } from 'react';
import { supabase } from '../supabaseClient';

function Cadastro({ setTelaAtual }) {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    regiao: '', 
    endereco: '',
    descricao: '', // Agora é geral para todo mundo!
    plano: 'free',
    link: '',
    whatsapp: '',
    instagram: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [fotoExtra1, setFotoExtra1] = useState(null);
  const [fotoExtra2, setFotoExtra2] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'descricao' && value.length > 200) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) setFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Mandando os dados direto para a tabela do Supabase
      const { data, error } = await supabase
        .from('servicos')
        .insert([
          {
            nome: formData.nome,
            categoria: formData.categoria,
            regiao: formData.regiao,
            endereco: formData.endereco,
            plano: formData.plano,
            descricao: formData.descricao, // Salva sempre a descrição geral
            link: formData.plano === 'premium' ? formData.link : null,
            whatsapp: formData.plano === 'free' ? formData.whatsapp : null,
            instagram: formData.plano === 'free' ? formData.instagram : null,
            imagem: logoFile ? `/${logoFile.name}` : '/placeholder.png',
            imagem2: fotoExtra1 ? `/${fotoExtra1.name}` : null,
            imagem3: fotoExtra2 ? `/${fotoExtra2.name}` : null,
          },
        ]);

      if (error) throw error;

      alert(`Sucesso! O cadastro de "${formData.nome}" foi salvo e enviado para análise.`);
      
      // Ajustado para '' para voltar para a Home do App.jsx corretamente
      setTelaAtual(''); 
    } catch (error) {
      console.error('Erro ao cadastrar no Supabase:', error.message);
      alert('Ops, ocorreu um erro ao salvar os dados. Tente novamente.');
    }
  };

  return (
    <div className="container my-5 animate__animated animate__fadeIn" style={{ maxWidth: '850px' }}>
      
      <div className="d-flex justify-content-between align-items-center mb-4 px-2">
        <div>
          <h2 className="fw-bold" style={{ color: '#5d4037', letterSpacing: '-1px' }}>
            Novo Cadastro | <span style={{ color: '#d63384' }}>Hub Serviços</span>
          </h2>
          <p className="text-muted">Escolha como quer exibir sua empresa para a região.</p>
        </div>
        
        {/* Ajustado para '' no clique do botão Sair */}
        <button className="btn btn-light rounded-pill px-4 shadow-sm border" onClick={() => setTelaAtual('')}>
          <i className="bi bi-x-lg me-2"></i>Sair
        </button>
      </div>

      <div className="card shadow border-0 p-4 p-md-5" style={{ borderRadius: '25px' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-bold small text-uppercase text-secondary">Nome do Estabelecimento</label>
              <input type="text" name="nome" className="form-control form-control-lg rounded-4 shadow-sm" placeholder="Ex: Nome da sua empresa" required value={formData.nome} onChange={handleChange} />
            </div>

            {/* 🛠️ CATEGORIA MUDADA PARA SELECT SEGURO */}
            <div className="col-md-6">
              <label className="form-label fw-bold small text-uppercase text-secondary">Categoria</label>
              <select 
                name="categoria" 
                className="form-select form-control-lg rounded-4 shadow-sm" 
                required 
                value={formData.categoria} 
                onChange={handleChange}
              >
                <option value="">Selecione uma categoria...</option>
                {['Academia', 'Artesanato', 'Comida', 'Doces', 'Esmalteria', 'Pet', 'Salão de Beleza', 'Saúde', 'Soluções Digitais'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* 🛠️ CIDADE / REGIÃO MUDADA PARA SELECT SEGURO */}
            <div className="col-md-6">
              <label className="form-label fw-bold small text-uppercase text-secondary">Cidade / Região</label>
              <select 
                name="regiao" 
                className="form-select form-control-lg rounded-4 shadow-sm" 
                required 
                value={formData.regiao} 
                onChange={handleChange}
              >
                <option value="">Selecione a cidade...</option>
                <option value="Itupeva, SP">Itupeva, SP</option>
                <option value="Jundiaí, SP">Jundiaí, SP</option>
                <option value="Louveira, SP">Louveira, SP</option>
                <option value="Cabreúva, SP">Cabreúva, SP</option>
                <option value="Indaiatuba, SP">Indaiatuba, SP</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-bold small text-uppercase text-secondary">Endereço Completo</label>
              <input type="text" name="endereco" className="form-control form-control-lg rounded-4 shadow-sm" placeholder="Rua, Número e Bairro" required value={formData.endereco} onChange={handleChange} />
            </div>

            <div className="col-12 mt-4">
              <label className="form-label fw-bold small text-uppercase text-secondary">Breve descrição dos seus serviços (Até 200 letras)</label>
              <textarea 
                name="descricao" 
                className="form-control rounded-4 shadow-sm" 
                rows="3" 
                placeholder="Ex: Especialistas em atendimento personalizado, serviços de qualidade e os melhores produtos do mercado..." 
                required
                value={formData.descricao} 
                onChange={handleChange}
              ></textarea>
              <div className="text-end small mt-1 text-muted">{formData.descricao.length}/200</div>
            </div>
          </div>

          {/* SELEÇÃO DO PLANO */}
          <div className="my-5 p-4 rounded-4 text-center" style={{ border: '2px dashed #dee2e6', backgroundColor: '#fcfaff' }}>
            <label className="form-label fw-bold small text-uppercase d-block mb-3 text-secondary">Escolha o nível do anúncio</label>
            <div className="btn-group w-100 shadow-sm rounded-pill overflow-hidden" role="group">
              <input type="radio" className="btn-check" name="plano" id="planFree" autoComplete="off" checked={formData.plano === 'free'} onChange={() => setFormData({...formData, plano: 'free'})} />
              <label className="btn btn-outline-secondary py-3 fw-bold" htmlFor="planFree">PLANO GRATUITO</label>

              <input type="radio" className="btn-check" name="plano" id="planPremium" autoComplete="off" checked={formData.plano === 'premium'} onChange={() => setFormData({...formData, plano: 'premium'})} />
              <label className="btn btn-outline-warning py-3 fw-bold" htmlFor="planPremium">⭐ PLANO PREMIUM</label>
            </div>
          </div>

          {/* SE FOR PREMIUM */}
          {formData.plano === 'premium' && (
            <div className="p-4 rounded-4 mb-4 border border-warning-subtle animate__animated animate__fadeIn" style={{ backgroundColor: '#fffdf5' }}>
              <h5 className="fw-bold text-warning-emphasis mb-4">✨ Recursos Exclusivos do Plano Premium</h5>
              
              <div className="mb-4">
                <label className="form-label fw-bold small text-uppercase">Link do seu Site ou Catálogo</label>
                <input type="url" name="link" className="form-control form-control-lg rounded-4 border-warning-subtle shadow-sm" placeholder="https://seusite.com" value={formData.link} onChange={handleChange} />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small text-uppercase">Foto do Trabalho 1 (Carrossel)</label>
                  <input type="file" accept="image/*" className="form-control rounded-4 border-warning-subtle" onChange={(e) => handleFileChange(e, setFotoExtra1)} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold small text-uppercase">Foto do Trabalho 2 (Carrossel)</label>
                  <input type="file" accept="image/*" className="form-control rounded-4 border-warning-subtle" onChange={(e) => handleFileChange(e, setFotoExtra2)} />
                </div>
              </div>
            </div>
          )}

          {/* SE FOR GRATUITO */}
          {formData.plano === 'free' && (
            <div className="row g-3 mb-4 animate__animated animate__fadeIn">
               <div className="col-md-6">
                <label className="form-label fw-bold small text-uppercase text-success">Link do WhatsApp</label>
                <input type="text" name="whatsapp" className="form-control rounded-4 shadow-sm" placeholder="https://wa.me/seu-numero" value={formData.whatsapp} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-uppercase text-danger">Link do Instagram</label>
                <input type="text" name="instagram" className="form-control rounded-4 shadow-sm" placeholder="https://instagram.com/seu-perfil" value={formData.instagram} onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="form-label fw-bold small text-uppercase text-secondary">Logotipo Principal / Imagem de Capa (Obrigatório)</label>
            <input type="file" accept="image/*" className="form-control form-control-lg rounded-4 shadow-sm" required onChange={(e) => handleFileChange(e, setLogoFile)} />
          </div>

          <button type="submit" className="btn btn-lg btn-primary w-100 rounded-pill py-3 fw-bold shadow mt-3 border-0" style={{ backgroundColor: '#d63384' }}>
            Finalizar Cadastro do Cliente
          </button>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;