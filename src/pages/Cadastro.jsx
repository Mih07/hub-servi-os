import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';


function Cadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo_negocio: '',
    categoria: '',
    outraCategoria: '',
    regiao: '', 
    endereco: '',
    bairro: '',
    descricao: '', // Agora é geral para todo mundo!
    plano: 'free',
    link: '',
    whatsapp: '',
    instagram: ''
  });
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState(null);
  const [fotoExtra1, setFotoExtra1] = useState(null);
  const [fotoExtra2, setFotoExtra2] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'descricao' && value.length > 200) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) setFile(file);
  };

  const uploadImage = async (file) => {
   const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`; 

    const { data, error } = await supabase.storage
      .from('imagens')
      .upload(fileName, file);

    if (error) throw error;

    const { data: url } = supabase.storage
      .from('imagens')
      .getPublicUrl(fileName);

    return url.publicUrl;
  };

  const gerarSlug = (nome) => {
  return nome
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Substitui espaços por hífen
    .replace(/[^\w-]+/g, '')  // Remove caracteres especiais
    .replace(/--+/g, '-');    // Remove hífens duplicados
};


const handleSubmit = async (e) => {
  e.preventDefault();
  // Validação da senha somente para o plano Gold
  if (formData.plano === 'gold') {
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    if (formData.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
  }

  let userId = null;

  try {
    // 1. CRIAR CONTA DO LOJISTA NO SUPABASE AUTH
      if (formData.plano === 'gold') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.senha,
        });

        if (authError) {
          alert(authError.message);
          return;
        }

        userId = data.user?.id;
      }

    // 2. UPLOAD DAS IMAGENS
    const logoUrl = logoFile ? await uploadImage(logoFile) : null;
    const img2 = fotoExtra1 ? await uploadImage(fotoExtra1) : null;
    const img3 = fotoExtra2 ? await uploadImage(fotoExtra2) : null;

    // 2. GERAR O SLUG A PARTIR DO NOME
    const slugGerado = gerarSlug(formData.nome);

    // 3. SALVAR NO SUPABASE (Incluindo o slug!)
    const { error } = await supabase
      .from('servicos')
      .insert([
        {
          user_id: userId,
          nome: formData.nome,
          tipo_negocio: formData.tipo_negocio,
          slug: slugGerado, 
          categoria: formData.categoria,
          outraCategoria:
            formData.categoria === 'Outra'
              ? formData.outraCategoria
              : null,
          regiao: formData.regiao,
          endereco: formData.endereco,
          bairro: formData.bairro,
          plano: formData.plano,
          descricao: formData.descricao,
          link: (formData.plano === 'premium' || formData.plano === 'gold') ? formData.link : null,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram,
          imagem: logoUrl,
          imagem2: img2,
          imagem3: img3,
        },
      ]);

    if (error) throw error;

    alert(`Sucesso! A loja "${formData.nome}" foi cadastrada.`);
    navigate('/');

  } catch (error) {
    console.error('Erro ao cadastrar no Supabase:', error.message);
    alert('Erro ao salvar: ' + error.message); // Exibe o erro real para debug
  }
};

  return (
    <div className="container my-5 animate__animated animate__fadeIn" style={{ maxWidth: '850px' }}>
      
      <div className="d-flex justify-content-between align-items-center mb-4 px-2">
        <div>
          <h2 className="fw-bold" style={{ color: '#5d4037', letterSpacing: '-1px' }}>
            Novo Cadastro | <span style={{ color: '#d63384' }}>Hub Serviços</span>
          </h2>
          <p className="text-muted">Escolha como sua empresa quer participar do Hub Serviços.</p>
        </div>
        
        {/* Ajustado para '' no clique do botão Sair */}
        <button className="btn btn-light rounded-pill px-4 shadow-sm border" onClick={() => navigate('/')}>
          <i className="bi bi-x-lg me-2"></i>Sair
        </button>
      </div>

      <div className="card shadow border-0 p-4 p-md-5" style={{ borderRadius: '25px' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="row g-3">
            <div className="col-12">
          <label className="form-label fw-bold small text-uppercase text-secondary">
            Nome do Estabelecimento
          </label>
          <input
            type="text"
            name="nome"
            className="form-control form-control-lg rounded-4 shadow-sm"
            placeholder="Ex: Nome da sua empresa"
            required
            value={formData.nome}
            onChange={handleChange}
          />
        </div>

        {/* DADOS DE ACESSO DO LOJISTA */}
        <div className="col-md-6">
          <label className="form-label fw-bold small text-uppercase text-secondary">
            E-mail de acesso
          </label>

          <input
            type="email"
            name="email"
            className="form-control form-control-lg rounded-4 shadow-sm"
            placeholder="Ex: contato@empresa.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* DADOS DE ACESSO - SOMENTE GOLD */}
        {formData.plano === 'gold' && (
          <>
            <div className="col-md-3">
              <label className="form-label fw-bold small text-uppercase text-secondary">
                Senha
              </label>

              <div className="input-group">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  className="form-control form-control-lg rounded-start-4 shadow-sm"
                  placeholder="Crie uma senha"
                  required
                  value={formData.senha}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-end-4"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  <i className={mostrarSenha ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-bold small text-uppercase text-secondary">
                Confirmar senha
              </label>

              <div className="input-group">
                <input
                  type={mostrarConfirmacao ? "text" : "password"}
                  name="confirmarSenha"
                  className="form-control form-control-lg rounded-start-4 shadow-sm"
                  placeholder="Repita a senha"
                  required
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-end-4"
                  onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                >
                  <i
                    className={
                      mostrarConfirmacao
                        ? "bi bi-eye-slash"
                        : "bi bi-eye"
                    }
                  ></i>
                </button>
              </div>
            </div>
          </>
        )}
            {/* TIPO DE NEGÓCIO */}
            <div className="col-md-6">
              <label className="form-label fw-bold small text-uppercase text-secondary">Tipo de Negócio</label>
              <select
                name="tipo_negocio"
                className="form-select form-control-lg rounded-4 shadow-sm"
                value={formData.tipo_negocio}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o tipo de negócio...</option>
                <option value="loja">🛍️ Loja</option>
                <option value="restaurante">🍔 Restaurante</option>
                <option value="prestador">🛠️ Prestador de serviços</option>
                <option value="profissional">👤 Profissional</option>
              </select>
            </div>

            {/* 🛠️ CATEGORIA MUDADA PARA SELECT SEGURO */}
            <div className="col-md-6">
                <label className="form-label fw-bold small text-uppercase text-secondary">
                  Categoria
                </label>

                <select
                  name="categoria"
                  className="form-select form-control-lg rounded-4 shadow-sm"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma categoria...</option>
                  <option value="Academia">Academia</option>
                  <option value="Alimentação">Alimentação</option>
                  <option value="Artesanato & Personalização">
                    Artesanato & Personalização
                  </option>
                  <option value="Automotivo">Automotivo</option>
                  <option value="Beleza & Estética">Beleza & Estética</option>
                  <option value="Casa & Decoração">Casa & Decoração</option>
                  <option value="Cosméticos & Perfumaria">
                    Cosméticos & Perfumaria
                  </option>
                  <option value="Construção & Reformas">
                    Construção & Reformas
                  </option>
                  <option value="Doces & Confeitaria">
                    Doces & Confeitaria
                  </option>
                  <option value="Educação & Cursos">
                    Educação & Cursos
                  </option>
                  <option value="Eventos & Entretenimento">
                    Eventos & Entretenimento
                  </option>
                  <option value="Flores & Plantas">
                    Flores & Plantas
                  </option>
                  <option value="Imóveis & Serviços Imobiliários">
                    Imóveis & Serviços Imobiliários
                  </option>
                  <option value="Jurídico & Contabilidade">
                    Jurídico & Contabilidade
                  </option>
                  <option value="Logística & Entregas">
                    Logística & Entregas
                  </option>
                  <option value="Moda & Acessórios">
                    Moda & Acessórios
                  </option>
                  <option value="Pet & Animais">
                    Pet & Animais
                  </option>
                  <option value="Saúde & Bem-estar">
                    Saúde & Bem-estar
                  </option>
                  <option value="Serviços para Casa">
                    Serviços para Casa
                  </option>
                  <option value="Tecnologia & Soluções Digitais">
                    Tecnologia & Soluções Digitais
                  </option>
                  <option value="Comércio em Geral">
                    Comércio em Geral
                  </option>
                  <option value="Outras Categorias">
                    Outras Categorias
                  </option>
                </select>

                {formData.categoria === 'Outra' && (
                  <input
                    type="text"
                    name="outraCategoria"
                    className="form-control mt-2 rounded-4 shadow-sm"
                    placeholder="Digite sua categoria"
                    value={formData.outraCategoria}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>

            {/* 🛠️ CIDADE / REGIÃO MUDADA PARA SELECT SEGURO */}
            <div className="col-md-6">
                <label className="form-label fw-bold small text-uppercase text-secondary">
                  Cidade / Região
                </label>

                <input
                  type="text"
                  name="regiao"
                  className="form-control form-control-lg rounded-4 shadow-sm"
                  placeholder="Ex: Itatiba, SP"
                  value={formData.regiao}
                  onChange={handleChange}
                  required
                />
              </div>

            <div className="col-12">
              <label className="form-label fw-bold small text-uppercase text-secondary">Endereço Completo</label>
              <input type="text" name="endereco" className="form-control form-control-lg rounded-4 shadow-sm" placeholder="Rua, Número" required value={formData.endereco} onChange={handleChange} />
            </div>

            <div className="col-12">
                <label className="form-label fw-bold small text-uppercase text-secondary">Bairro</label>
                <input 
                  type="text" 
                  name="bairro" 
                  className="form-control form-control-lg rounded-4 shadow-sm" 
                  placeholder="Ex: Centro, Vila Nova..." 
                  required 
                  value={formData.bairro} 
                  onChange={handleChange} 
                />
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
            <label className="form-label fw-bold small text-uppercase d-block mb-3 text-secondary">Escolha o plano ideal para a sua empresa</label>
            <div className="row g-3">

              <div className="col-md-4">
                <div
                  className={`card h-100 text-center shadow-sm ${
                    formData.plano === 'free' ? 'border-primary border-3' : ''
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setFormData({ ...formData, plano: 'free' })}
                >
                  <div className="card-body">
                    <h5 className="fw-bold">Plano Gratuito</h5>
                    <h3 className="text-success">R$ 0</h3>
                    <ul className="list-unstyled small">
                      <li>✓ Perfil da empresa no Hub</li>
                      <li>✓ Botão para WhatsApp</li>
                      <li>✓ Link para Instagram</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className={`card h-100 text-center shadow-sm ${
                    formData.plano === 'premium' ? 'border-warning border-3' : ''
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setFormData({ ...formData, plano: 'premium' })}
                >
                  <div className="card-body">
                    <h5 className="fw-bold">⭐ Premium</h5>
                    <h3 className="text-warning">R$ 39,90</h3>
                    <ul className="list-unstyled small">
                      <li>✓ Tudo do Gratuito</li>
                      <li>✓ Carrossel de fotos</li>
                      <li>✓ Link externo para site ou catálogo</li>
                      <li>✓ Destaque Premium</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className={`card h-100 text-center shadow-sm ${
                    formData.plano === 'gold' ? 'border-dark border-3' : ''
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setFormData({ ...formData, plano: 'gold' })}
                >
                  <div className="card-body">
                    <h5 className="fw-bold">⭐ GOLD</h5>
                    <h3 style={{ color: '#d4af37' }}>R$ 89,90</h3>
                    <ul className="list-unstyled small">
                      <li>✓ Tudo do Premium</li>
                      <li>✓ Vitrine própria dentro do Hub</li>
                      <li>✓ Produtos, serviços ou cardápio</li>
                      <li>✓ Carrinho de Pedidos</li>
                      <li>✓ Pedidos via WhatsApp automático</li>
                      <li>✓ Área do Lojista para gerenciamento</li>
                      <li>✓ Acompanhamento de acessos e resultados</li>
                      <li>✓ Integração com Google Maps</li>
                      <li>✓ Destaque Gold</li>
                    </ul>
                  </div>
                </div>
              </div>

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