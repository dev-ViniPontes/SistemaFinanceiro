import React, { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';

const AdicionarReceita = ({ onAdicionarReceita }) => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().slice(0, 10), // Data de hoje no formato YYYY-MM-DD
    tipo: 'salario' // salario, freelancer, investimentos, outros
  });

  const [erro, setErro] = useState('');

  const tiposReceita = [
    { id: 'salario', nome: 'Salário' },
    { id: 'freelancer', nome: 'Freelancer' },
    { id: 'investimentos', nome: 'Investimentos' },
    { id: 'bonus', nome: 'Bônus' },
    { id: 'vendas', nome: 'Vendas' },
    { id: 'outros', nome: 'Outros' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (!formData.descricao.trim()) {
      setErro('Descrição é obrigatória');
      return;
    }

    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      setErro('Valor deve ser maior que zero');
      return;
    }

    if (!formData.data) {
      setErro('Data é obrigatória');
      return;
    }

    // Adicionar receita
    onAdicionarReceita({
      ...formData,
      valor: valor,
      tipo: formData.tipo
    });

    // Limpar formulário
    setFormData({
      descricao: '',
      valor: '',
      data: new Date().toISOString().slice(0, 10),
      tipo: 'salario'
    });

    alert('Receita adicionada com sucesso!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Adicionar Receita</h2>
        <p className="text-gray-600">
          Registre uma nova fonte de renda para controlar melhor suas finanças.
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {erro && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <p className="text-danger-700 text-sm">{erro}</p>
            </div>
          )}

          <div>
            <label className="label" htmlFor="descricao">
              Descrição *
            </label>
            <input
              type="text"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              className="input"
              placeholder="Ex: Salário mensal,freelance de site..."
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="valor">
              Valor *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="valor"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                className="input pl-10"
                placeholder="0,00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="data">
              Data *
            </label>
            <input
              type="date"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleInputChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="tipo">
              Tipo de Receita
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="input"
            >
              {tiposReceita.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="btn btn-primary flex-1 sm:flex-none flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Adicionar Receita</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setFormData({
                  descricao: '',
                  valor: '',
                  data: new Date().toISOString().slice(0, 10),
                  tipo: 'salario'
                });
                setErro('');
              }}
              className="btn btn-secondary flex-1 sm:flex-none"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>

      {/* Dicas */}
      <div className="mt-8 card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Dicas</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>• Seja específico na descrição para facilitar consultas futuras</li>
          <li>• Registre receitas regularmente para manter o controle atualizado</li>
          <li>• Use tipos diferentes para categorizar suas fontes de renda</li>
          <li>• Você pode alterar o mês de referência nas configurações</li>
        </ul>
      </div>
    </div>
  );
};

export default AdicionarReceita;