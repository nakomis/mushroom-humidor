import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { Context } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger();

type MushroomCommand = {
  commandType: string;
  action: string;
};

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  async handler(_event: any, _context: Context) {
    logger.info('Command Processor Lambda function invoked', {
      event: _event,
      context: _context,
    });
    const body : MushroomCommand = JSON.parse(_event?.body || '{}');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hello from the command processor Lambda function!',
        commandType: body.commandType,
        action: body.action,
      }),
    };
  }
}
const lambda = new Lambda();
export const handler = lambda.handler.bind(lambda);