import json
import time
from scapy.all import sniff, IP, TCP, ICMP

#load firewall rules either from json files or can define them here if simple
def load_rules(filename="rules.json"):
    try:
        with open(filename, "r") as f:
            rules = json.load(f)
    except FileNotFoundError:
        print("Rule file not found... setting default values")
        rules = {
            "BannedPorts": [80],
            "BlockPingAttacks": True
        }
    return rules

#packet handling function
def packet_handler(packet):
    #check if packet is ip
    if packet.haslayer(IP):
        ip_layer = packet.getlayer(IP)

        #Block HTTP traffic (port 80)
        if rules.get("BannedPorts") and packet.haslayer(TCP):
            tcp_layer = packet.getlayer(TCP)
            if tcp_layer.dport in rules["BannedPorts"]:
                print(f"Blocked packet : {ip_layer.src} -> {ip_layer.dst}:{tcp_layer.dport}")
                return      #dropping the packet and not forwarding it
            
        if rules.get("BlockPingAttacks", False) and packet.haslayer(ICMP):
            icmp_layer = packet.getlayer(ICMP)
            if icmp_layer.type == 8:    #echo request
                print(f"Blocked ping request from {ip_layer.src}")
                return
    #forward the packet if not blocked
    

def start_firewall(interface="wlp3s0"):
    print(f"Starting firewall on {interface}...")
    sniff(iface=interface, prn=packet_handler)

if __name__ == "__main__":
    rules = load_rules()
    try:
        start_firewall("wlp3s0")
    except KeyboardInterrupt:
        print("Firewall Stopped!")