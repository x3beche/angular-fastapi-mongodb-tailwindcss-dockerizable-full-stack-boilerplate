import { Component, Input } from "@angular/core";
import { initFlowbite } from "flowbite";
import { Message } from "src/app/models/utils";
import { Dismiss } from "flowbite";
import type { DismissOptions, DismissInterface } from "flowbite";
import type { InstanceOptions } from "flowbite";
import * as uuid from "uuid";

@Component({
  selector: "app-message",
  templateUrl: "./message.component.html",
})
export class MessageComponent {
  @Input() message!: Message;
  id!: string;
  alert_dismis!: DismissInterface;
  status = true;
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    initFlowbite();
    this.id = uuid.v4();
    // target element that will be dismissed
    const $targetEl: HTMLElement | null = document.getElementById(this.id);

    // optional trigger element
    const $triggerEl: HTMLElement | null =
      document.getElementById("triggerElement");

    // options object
    const options: DismissOptions = {
      transition: "transition-opacity",
      duration: 1000,
      timing: "ease-out",

      // callback functions
      onHide: (context, targetEl) => {
        console.log("element has been dismissed");
        console.log(targetEl);
      },
    };

    // instance options object
    const instanceOptions: InstanceOptions = {
      id: this.id,
      override: true,
    };

    /*
     * $targetEl (required)
     * $triggerEl (optional)
     * options (optional)
     * instanceOptions (optional)
     */
    const dismiss: DismissInterface = new Dismiss(
      $targetEl,
      $triggerEl,
      options,
      instanceOptions
    );

    // programmatically hide it
    this.alert_dismis = dismiss;
  }

  close_alert(): void {
    this.status = !this.status;
  }
}
