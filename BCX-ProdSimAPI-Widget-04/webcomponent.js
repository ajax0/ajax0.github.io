(function()  {
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
        <style>
            .datasource {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .datasource > div {
                display: inline-block;
                vertical-align: middle;
            }

            .data-age, .refresh-timer {
                margin: 0px 12px;
            }

            .data-age > * {
                display: inline-block;
                vertical-align: middle;
            }

            .refresh-timer > * {
                display: inline-block;
                vertical-align: middle;
            }
        </style>
        <div class="datasource">
            <div class="data-age">
                <div class="label">Last Refreshed:</div>
                <div class="value">Loading</div>
            </div>
            <div class="refresh-timer">
                <div class="label">Next Refresh:</div>
                <div class="value">Never</div>
                <button id="refresh">Refresh Now</button>
            </div>
        </div>
    `;

    customElements.define('com-sap-sample-prodsimapi04', class ProdSimAPI01 extends HTMLElement {
        constructor() {
            super();
                this.appendChild(tmpl.content.cloneNode(true));
    
                this._props = {
                    JSONUrl: "https://bcx-prod-sim-app.c-07113c9.kyma.ondemand.com/predict?product=MR311651",
                    RefreshTime: 300
                };
    
                //Get refrences to our root element
                this.$div = this.querySelector('div.datasource');
    
                //Add the handler for our refresh button 
                this.$div.querySelector('#refresh').onclick = (e) => this.refresh();
            }
            
            refresh() {
                if(this._props["JSONUrl"]) {
                    this.updateData(this._props["JSONUrl"])
                }
            }
    
            updateData(url) {
                console.log("from updateData");
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        this._rawData = data;
                        this.startRefreshCountdown();
                        console.log(this._rawdata);
                        const event = new Event("onDataUpdate");
                        this.dispatchEvent(event);
                    });
                
            }

            getRawData() {
                return this._rawData || {};
            }
            
            getJSONData(type) {
                let data = {};
            
                if(type == "raw") {
                    data = this.getRawData();
                }
            
                return JSON.stringify(data);
            }
    
            startRefreshCountdown() {
                if(this._refreshTimeout) clearTimeout(this._refreshTimeout);
    
                this._refreshTimeout = setTimeout(() => this.refresh(), this._props["RefreshTime"] * 1000);
    
                const end = new Date().getTime() + (this._props["RefreshTime"] * 1000);
    
                if(this._countdownInterval) clearInterval(this._countdownInterval);
    
                this._countdownInterval = setInterval(() => {
                    let now = new Date().getTime();
                    let distance = end - now;
    
                    let timestring = distance > 60000 ? Math.floor(distance / (1000 * 60)) + " Minutes" : Math.floor(distance / (1000)) + " Seconds";
    
                    this.$div.querySelector(".refresh-timer .value").innerText = timestring; 
                }, 1000);
            }
    
            onCustomWidgetBeforeUpdate(oChangedProperties) {
                let oldUrl = this._props['JSONUrl'];
                let newUrl = oChangedProperties['JSONUrl'];
    
                if(newUrl != oldUrl) {
                    this.updateData(newUrl);
                }
    
                this._props = { ...this._props, ...oChangedProperties};
        }


    });
    
})();