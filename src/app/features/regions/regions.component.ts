import { Component, OnInit, ViewChild } from '@angular/core'; // Importa las utilidades necesarias para el componente.
import { CommonModule } from '@angular/common'; // Importa CommonModule para directivas como ngIf y ngFor.
import { RegionService } from '../..//core/services/region.service'; // Importa el servicio para obtener las regiones.
import { Router } from '@angular/router'; // Importa el Router para realizar la redirección.
import {MatTableDataSource} from '@angular/material/table'; // Importa MatTableDataSource para la tabla de datos.
import {MatPaginator, PageEvent} from '@angular/material/paginator'; // Importa MatPaginator para la paginación de la tabla.
import { MatSort, Sort } from '@angular/material/sort'; // Importa MatSort para ordenar la tabla.
import {MatTableModule} from '@angular/material/table'; // Importa MatTableModule para la tabla de datos.
import {MatPaginatorModule} from '@angular/material/paginator'; // Importa MatPaginationModule para la paginación de la tabla.
import {MatSortModule} from '@angular/material/sort'; // Importa MatSortModule para ordenar la tabla.


@Component({
  selector: 'app-regions', // Selector del componente.
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule], // Módulos necesarios para las funcionalidades comunes de Angular.
  templateUrl: './regions.component.html', // Archivo de plantilla HTML asociado.
  styleUrls: ['./regions.component.sass'], // Archivo de estilos SCSS asociado.
})
export class RegionsComponent implements OnInit {

  displayedColumns: string[] = ['id', 'name']; // Columnas a mostrar en la tabla.
  dataSource = new MatTableDataSource<any>([]); // Fuente de datos para la tabla.
  totalElements: number = 0;
  totalPages : number =0;
  currentPage: number = 0;
  pageSize: number = 10;
  sortColumn: string = 'name';
  sortDirection: string = 'asc';

  regions: any[] = []; // Almacena las regiones obtenidas del servicio.
  error: string | null = null; // Almacena un mensaje de error si ocurre.


  @ViewChild(MatPaginator) paginator!: MatPaginator; // Paginador de la tabla.
  @ViewChild(MatSort) sort!: MatSort; // Ordenador de la tabla.

  constructor(private regionService: RegionService, private router: Router) {} // Inyecta el servicio RegionService y el Router.

  ngOnInit() {
    // Llama al servicio para obtener las regiones mediante un observable.
    this.regionService.fetchRegions(this.currentPage, this.pageSize, this.sortColumn, this.sortDirection).subscribe({
      // Manejo exitoso de la respuesta:
      next: (res: any) => (this.regions = res),

      // Manejo de errores:
      error: (err) => {
        if (err.status === 403) {
          // Si el error es 403, redirige al componente ForbiddenComponent.
          this.router.navigate(['/forbidden']);
        } else {
          // Si ocurre otro error, muestra un mensaje genérico.
          this.error = 'An error occurred';
        }
      },
    });
  }


  ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
  this.sort.sortChange.subscribe((sort: Sort) => this.handleSortEvent(sort));

  }

  fetchRegions(page: number, size: number, sortColumn: string, sortDirection: string){
    console.log(`Llamando al servicio con paginas:  ${page} , tamaño: ${size}, orden: ${sortColumn} ${sortDirection} `);
    this.regionService.fetchRegions(page,size,sortColumn, sortDirection).subscribe({
      next :( res: any) => {
      console.log(`Datos recibidos:  elementos, total paginas: ${res.totalPages}`)

      this.dataSource.data = res.content;
      this.totalElements = res.totalElements;
      this.totalPages = res.totalPages;
      this.currentPage = res.currenPage;
      this.pageSize = res.pageSize;

      setTimeout(()=>{
        this.paginator.length = this.totalElements;
        this.paginator.pageIndex = this.currentPage;
        this.paginator.pageSize = this.pageSize;
      });
    },
    error: (err) => {
      console.error("Error al obtener datos: ", err);
      if(err.status === 403){
        this.router.navigate(['/forbidden']);

      }else{
        this.error = "Error al cargar las regiones";
      }
    },
  });
  }

  handlePageEvent(event: PageEvent){
    console.log(`CAmbio de pagina detectado: PAgina ${event.pageIndex}, Tamaño ${event.pageSize}`);
    this.fetchRegions(event.pageIndex, event.pageSize, this.sortColumn, this.sortDirection);
  }

  handleSortEvent(sort: Sort){
    console.log(`Cambio de orden detectado: Ordenacion por ${sort.active}, (${sort.direction})`);
    this.sortColumn = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.fetchRegions(this.currentPage, this.pageSize, this.sortColumn, this.sortDirection);
  }
}
