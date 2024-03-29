import 'zone.js/dist/zone';
import { Component, inject, Injector, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';

export class NamedCmp {
  name: string = 'unnamed';
}

@Component({
  selector: 'my-cmp1',
  standalone: true,
  imports: [CommonModule],
  providers: [{ provide: NamedCmp, useExisting: Cmp1 }],
  template: `
    <h1>Cmp1</h1>
    <div style="padding-left: 1rem"><ng-content></ng-content></div>
  `,
})
export class Cmp1 extends NamedCmp {
  name = 'Component1';
}

@Component({
  selector: 'my-cmp2',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>{{name}}, parent: {{parent?.name ?? ""}}</h1>
    <div style="padding-left: 1rem"><ng-content></ng-content></div>
  `,
})
export class Cmp2 extends NamedCmp {
  name = 'Cmp2';
  parent = inject(NamedCmp, { optional: true });
}

@Component({
  selector: 'my-app',
  standalone: true,

  imports: [CommonModule, Cmp1, Cmp2],
  template: `
    <h1>Declarative Nesting</h1>
    <my-cmp1><my-cmp2/></my-cmp1>

    <h1>Programmatic Nesting</h1>
    <span style="color:red">Note the missing parent, because we can't reproduce the injector hierarchy like with delcarative nesting above</span>
  `,
})
export class App {
  vcr = inject(ViewContainerRef);

  constructor() {
    const cmp2 = this.vcr.createComponent(Cmp2);
    const cmp1 = this.vcr.createComponent(Cmp1, {
      projectableNodes: [[cmp2.location.nativeElement]],
    });

    const cmp3 = this.vcr.createComponent(Cmp2, { injector: cmp1.injector });
    cmp3.instance.name = 'Cmp3';

    // if there was a setProjectableNodes method on element ref this scenario would be possible
    // cmp1.setProjectableNodes([[cmp3.location.nativeElement]])
  }
}

bootstrapApplication(App);
