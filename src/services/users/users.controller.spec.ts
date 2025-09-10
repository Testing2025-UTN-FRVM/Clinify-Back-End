import { UsersController } from './users.controller';
import { LoginDTO } from '../../interfaces/login.dto';


describe('UsersController', () => {
  let controller: UsersController;
  let service: any;

  beforeEach(() => {
    service = {
      login: jest.fn(),
      refreshToken: jest.fn(),
    };
    controller = new UsersController(service as any);
  });

  it('me should return user email from request', () => {
    const req = { user: { email: 'test@correo.com' } };
    const result = controller.me(req as any);
    expect(result).toEqual({ email: 'test@correo.com' });
  });

  it('login should call service.login and return its result', async () => {
    const body: LoginDTO = { email: 'a@b.com', password: '123' };
    const expected = { accessToken: 'token' };
    service.login.mockResolvedValue(expected);

    const result = await controller.login(body);
    expect(service.login).toHaveBeenCalledWith(body);
    expect(result).toBe(expected);
  });

  it('refreshToken should call service.refreshToken with header', async () => {
    const req = { headers: { 'refresh-token': 'refresh123' } };
    service.refreshToken.mockResolvedValue('ok');

    const result = await controller.refreshToken(req as any);
    expect(service.refreshToken).toHaveBeenCalledWith('refresh123');
    expect(result).toBe('ok');
  });
});