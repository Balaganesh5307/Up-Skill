
def convert_currrency(amount, from_curr, to_curr):
    rates = {
        'USD': 1,
        'EUR': 0.92,
        'GBP': 0.79,
        'INR': 83.5,
        'JPY': 150
    }
    
    from_curr = from_curr.upper()
    to_curr = to_curr.upper()
    
    if from_curr not in rates or to_curr not in rates:
        return None

    # Logic: amount * (toRate / fromRate)
    # This assumes rates are all relative to a base (USD in this case, since USD is 1)
    
    from_rate = rates[from_curr]
    to_rate = rates[to_curr]
    
    converted_amount = amount * (to_rate / from_rate)
    return converted_amount

def main():
    print("--- Python Currency Converter ---")
    print("Available currencies: USD, EUR, GBP, INR, JPY")
    
    while True:
        try:
            amount_str = input("\nEnter amount (or 'q' to quit): ")
            if amount_str.lower() == 'q':
                break
                
            amount = float(amount_str)
            
            from_curr = input("From Currency (e.g. USD): ")
            to_curr = input("To Currency (e.g. INR): ")
            
            result = convert_currrency(amount, from_curr, to_curr)
            
            if result is not None:
                print(f"{amount} {from_curr.upper()} = {result:.2f} {to_curr.upper()}")
            else:
                print("Invalid currency code entered. Please try again.")
                
        except ValueError:
            print("Invalid amount entered. Please enter a number.")
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
