import { CommandHandler, ICommandHandler, InvalidCommandHandlerException } from "@nestjs/cqrs";
import { CreateUserCommand } from "../create-user.command";

@CommandHandler('CreateUserCommand')
class  CreateUserHandler  implements ICommandHandler<CreateUserCommand>
{

    async execute(command: CreateUserCommand): Promise<any> {
         const { name, email } = command;
 // save user logic
           return {
      message: 'User created',
    };
    }

}