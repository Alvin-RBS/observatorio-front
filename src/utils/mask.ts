export const maskMoney = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = event.currentTarget;
  return value
    .replace(/\D/g, '')
    .replace(/(\d)(\d{2})$/, '$1,$2')
    .replace(/(?=(\d{3})+(\D))\B/g, '.');
};

export const maskCPF = (event: React.ChangeEvent<HTMLInputElement>) => {
  event.currentTarget.maxLength = 15;
  const { value } = event.currentTarget;

  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const maskPhone = (event: React.ChangeEvent<HTMLInputElement>) => {
  event.currentTarget.maxLength = 15;
  const { value } = event.currentTarget;
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})/, '$1-$2');
};

export const maskCEP = (event: React.ChangeEvent<HTMLInputElement>) => {
  event.currentTarget.maxLength = 9;
  const { value } = event.currentTarget;
  return value.replace(/\D/g, '').replace(/^(\d{5})(\d{3})+?$/, '$1-$2');
};

export const maskCNPJ = (event: React.ChangeEvent<HTMLInputElement>) => {
  event.currentTarget.maxLength = 18;
  const { value } = event.currentTarget;
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{4})/, '$1/$2')
    .replace(/(\d{4})(\d{2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

export type MaskTypes = 'cpf' | 'money' | 'phone' | 'cep' | 'cnpj';

type Masks = Record<
  MaskTypes,
  (event: React.ChangeEvent<HTMLInputElement>) => string
>;

const masks: Masks = {
  cpf: maskCPF,
  money: maskMoney,
  phone: maskPhone,
  cep: maskCEP,
  cnpj: maskCNPJ,
};

export default masks;