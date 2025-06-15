
import {RoutesOnOrders} from './routesOnOrders.entity'


export class Route {
  routeId: string ;
name: string ;
deleted: boolean ;
order?: RoutesOnOrders[] ;
}
